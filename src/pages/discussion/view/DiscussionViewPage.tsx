import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Dropdown,
  Form,
  Header,
  Icon,
  Input,
  Label,
  Menu,
  Popup,
  Ref,
  Segment,
  TextArea
} from "semantic-ui-react";
import { Link, useNavigation } from "react-navi";
import { observer } from "mobx-react";
import * as timeago from "timeago.js";
import twemoji from "twemoji";
import TextAreaAutoSize from "react-textarea-autosize";

import style from "./DiscussionViewPage.module.less";
import LoadMoreBackground from "./LoadMoreBackground.svg";

import { defineRoute, RouteError } from "@/AppRouter";
import { appState } from "@/appState";
import { DiscussionApi } from "@/api";
import { useAsyncCallbackPending, useLocalizer, useDialog, useFocusWithin, useConfirmUnload } from "@/utils/hooks";
import { useScreenWidthWithin } from "@/utils/hooks/useScreenWidthWithin";
import { getDiscussionDisplayTitle } from "../utils";
import toast from "@/utils/toast";
import UserLink from "@/components/UserLink";
import formatDateTime from "@/utils/formatDateTime";
import UserAvatar from "@/components/UserAvatar";
import MarkdownContent from "@/markdown/MarkdownContent";
import PseudoLink from "@/components/PseudoLink";
import svgToDataUrl from "@/utils/svgToUrl";
import { onEnterPress } from "@/utils/onEnterPress";
import PermissionManager from "@/components/LazyPermissionManager";
import { getBreadcrumb, getNewDiscussionUrl } from "../discussions/DiscussionsPage";
import { makeToBeLocalizedText } from "@/locales";

const loadMoreBackground = svgToDataUrl(LoadMoreBackground);

async function fetchData(discussionId: number) {
  const pagination = appState.serverPreference.pagination;
  const { requestError, response } = await DiscussionApi.getDiscussionAndReplies({
    locale: appState.locale,
    queryRepliesType: "HeadTail",
    discussionId,
    getDiscussion: true,
    headTakeCount: pagination.discussionRepliesHead,
    tailTakeCount: pagination.discussionReplies - pagination.discussionRepliesHead
  });

  if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });
  else if (response.error) throw new RouteError(makeToBeLocalizedText(`discussion.errors.${response.error}`));

  return response;
}

interface AutoTimeAgoLabelProps {
  time: Date;
}

const AutoTimeAgoLabel: React.FC<AutoTimeAgoLabelProps> = React.memo(props => {
  // Update per 30s
  const UPDATE_INTERVAL = 30 * 1000;

  // Use time ago if within 30 days
  const MAX_TIME_AGO = 30 * 24 * 60 * 60 * 1000;

  const [timeAgoRelativeDate, setTimeAgoRelativeDate] = useState(new Date());

  const getUseTimeAgo = () => +timeAgoRelativeDate - +props.time <= MAX_TIME_AGO;
  const [useTimeAgo, setUseTimeAgo] = useState(getUseTimeAgo());

  useEffect(() => {
    if (useTimeAgo) {
      const id = setInterval(() => setTimeAgoRelativeDate(new Date()), UPDATE_INTERVAL);
      return () => clearInterval(id);
    }
  }, [useTimeAgo]);

  useEffect(() => {
    if (getUseTimeAgo() !== useTimeAgo) setUseTimeAgo(!useTimeAgo);
  }, [timeAgoRelativeDate, props.time]);

  const fullDateTime = formatDateTime(props.time)[1];

  return (
    <>
      {useTimeAgo ? (
        <span title={fullDateTime}>
          {timeago.format(props.time, appState.locale, {
            relativeDate: timeAgoRelativeDate
          })}
        </span>
      ) : (
        fullDateTime
      )}
    </>
  );
});

interface EmojiProps extends React.HTMLAttributes<HTMLDivElement> {
  emoji: string;
}

const Emoji: React.FC<EmojiProps> = React.memo(props => (
  // TODO: use twemoji for all UGC
  <div
    {...props}
    className={style.emoji + (props.className ? " " + props.className : "")}
    dangerouslySetInnerHTML={{
      __html: twemoji.parse(props.emoji, {
        base: "https://cdn.jsdelivr.net/npm/@discordapp/twemoji@13.0.1/dist/",
        size: "svg",
        ext: ".svg"
      })
    }}
  />
));

interface ReactionEmojiPickerProps {
  currentUserReactions: string[];
  onSelectEmoji: (emoji: string) => void;
}

const ReactionEmojiPicker: React.FC<ReactionEmojiPickerProps> = props => {
  const _ = useLocalizer("discussion");

  const custom = appState.serverPreference.misc.discussionReactionAllowCustomEmojis;
  const emojis = appState.serverPreference.misc.discussionReactionEmojis;

  const count = emojis.length;
  const columns = count % 5 == 0 ? 5 : count % 4 == 0 ? 4 : count % 3 == 0 ? 3 : count % 2 == 0 ? 2 : 1;
  const rows = Math.floor(count / columns);
  const emojiGrid = Array(rows)
    .fill(null)
    .map((_, i) =>
      Array(columns)
        .fill(null)
        .map((_, j) => emojis[i * columns + j])
    );

  return (
    <div className={style.emojiPicker}>
      <div className={style.emojiGrid}>
        {emojiGrid.map((emojiRow, i) => (
          <div className={style.emojiRow} key={i}>
            {emojiRow.map(emoji => (
              <Emoji
                key={emoji}
                className={style.emoji + (props.currentUserReactions.includes(emoji) ? " " + style.selected : "")}
                emoji={emoji}
                onClick={() => props.onSelectEmoji(emoji)}
              />
            ))}
          </div>
        ))}
      </div>
      {custom && (
        <Input
          className={style.customEmoji}
          placeholder={_(".custom_emoji")}
          fluid
          onKeyPress={onEnterPress(e => props.onSelectEmoji((e.target as HTMLInputElement).value.trim()))}
        />
      )}
    </div>
  );
};

interface DiscussionItemProps {
  type: "Discussion" | "Reply";
  discussion: ApiTypes.DiscussionDto;

  content: string;
  isPublic: boolean;
  reactions: ApiTypes.DiscussionOrReplyReactionsDto;
  publisher: ApiTypes.UserMetaDto;
  publishTime: Date;
  editTime: Date;
  permission: ApiTypes.DiscussionDto["permissions"];

  onReaction: (emoji: string, reaction: boolean) => Promise<void>;
  onQuote?: () => void;
  onSetPublic: () => Promise<void>;
  onManagePermission?: () => void;
  onEnterEdit: string | (() => void);
  onDelete: () => Promise<void>;
}

const DiscussionItem: React.FC<DiscussionItemProps> = props => {
  const _ = useLocalizer("discussion.item");

  const isMobile = useScreenWidthWithin(0, 768);

  const emojisAndCount = (Object.entries(props.reactions.count) as [string, number][])
    .filter(([, count]) => count)
    .sort(([emoji1], [emoji2]) => {
      function emojiToKey(emoji: string) {
        const i = appState.serverPreference.misc.discussionReactionEmojis.indexOf(emoji);
        if (i !== -1) return String.fromCodePoint(i);
        return emoji;
      }

      return emojiToKey(emoji1) < emojiToKey(emoji2) ? -1 : 1;
    });

  const statePendingEmojis = useState<string[]>([]);
  const [pendingEmojis, setPendingEmojis] = statePendingEmojis;
  const refStatePendingEmojis = useRef<typeof statePendingEmojis>();
  refStatePendingEmojis.current = statePendingEmojis;
  function onSelectEmoji(emoji: string) {
    if (pendingEmojis.includes(emoji)) return;

    setPendingEmojis(pendingEmojis.concat(emoji));
    props.onReaction(emoji, !props.reactions.currentUserReactions.includes(emoji)).then(() => {
      const [pendingEmojis, setPendingEmojis] = refStatePendingEmojis.current;
      setPendingEmojis(pendingEmojis.filter(s => s !== emoji));
    });
  }

  const [pendingSetPublic, onSetPublic] = useAsyncCallbackPending(props.onSetPublic);
  const [pendingDelete, onDelete] = useAsyncCallbackPending(props.onDelete);

  const [emojiPopupOpen, setEmojiPopupOpen] = useState(false);
  const [actionDropdownOpen, setActionDropdownOpen] = useState(false);
  const [confirmSetPublicPopupOpen, setConfirmSetPublicPopupOpen] = useState(false);

  // Delete a reply -- popup confirm
  // Delete a discussion -- full page dialog confirm
  const [confirmDeletePopupOpen, setConfirmDeletePopupOpen] = useState(false);
  const confirmDeleteDialog = useDialog(
    {
      basic: true
    },
    () => (
      <>
        <Header icon="delete" content={_(".actions.confirm_delete_dialog_title")} />
      </>
    ),
    () => _(".actions.confirm_delete_dialog_content"),
    () => (
      <>
        <Button
          basic
          inverted
          negative
          content={_(".actions.confirm_delete_dialog_confirm")}
          loading={pendingDelete}
          onClick={onDelete}
        />
        <Button
          basic
          inverted
          content={_(".actions.confirm_delete_dialog_cancel")}
          disabled={pendingDelete}
          onClick={() => confirmDeleteDialog.close()}
        />
      </>
    )
  );

  const refActionsMenuIcon = useRef<HTMLElement>();

  const actions = [
    props.permission.includes("Modify") &&
      (typeof props.onEnterEdit === "string" ? (
        <Dropdown.Item icon="edit" text={_(".actions.edit")} as={Link} href={props.onEnterEdit} />
      ) : (
        <Dropdown.Item icon="edit" text={_(".actions.edit")} onClick={props.onEnterEdit} />
      )),
    props.type === "Reply" && appState.currentUser && (
      <Dropdown.Item icon="quote left" text={_(".actions.quote")} onClick={props.onQuote} />
    ),
    props.permission.includes("ManagePermission") && (
      <Dropdown.Item icon="key" text={_(".actions.permission_manage")} onClick={props.onManagePermission} />
    ),
    props.permission.includes("ManagePublicness") && (
      <Popup
        trigger={
          <Dropdown.Item
            icon={props.isPublic ? "eye slash" : "eye"}
            text={props.isPublic ? _(".actions.set_non_public") : _(".actions.set_public")}
          />
        }
        content={
          <Button
            positive={!props.isPublic}
            content={props.isPublic ? _(".actions.confirm_set_non_public") : _(".actions.confirm_set_public")}
            onClick={() => {
              setConfirmSetPublicPopupOpen(false);
              onSetPublic();
            }}
          />
        }
        open={confirmSetPublicPopupOpen}
        onOpen={() => setConfirmSetPublicPopupOpen(true)}
        onClose={() => setConfirmSetPublicPopupOpen(false)}
        context={refActionsMenuIcon.current}
        on="click"
        position="top center"
      />
    ),
    props.permission.includes("Delete") && (
      <Popup
        trigger={
          <Dropdown.Item
            className={style.delete}
            icon="delete"
            text={_(".actions.delete")}
            onClick={props.type === "Discussion" ? confirmDeleteDialog.open : undefined}
          />
        }
        content={
          <Button
            negative
            content={_(".actions.confirm_delete")}
            onClick={() => {
              setConfirmDeletePopupOpen(false);
              onDelete();
            }}
          />
        }
        disabled={props.type === "Discussion"}
        open={confirmDeletePopupOpen}
        onOpen={() => setConfirmDeletePopupOpen(true)}
        onClose={() => setConfirmDeletePopupOpen(false)}
        context={refActionsMenuIcon.current}
        on="click"
        position="top center"
      />
    )
  ]
    .filter(e => e)
    .map((e, i) => <React.Fragment key={i}>{e}</React.Fragment>);

  const label = !props.isPublic ? (
    <Label className={style.label} icon="eye slash" color="red" content={_(".label.nonpublic")} basic />
  ) : props.publisher.id === props.discussion.problem?.meta?.ownerId ? (
    <Label className={style.label} content={_(".label.problem_owner")} basic />
  ) : props.publisher.id === props.discussion.publisher.id && props.type === "Reply" ? (
    <Label className={style.label} content={_(".label.discussion_publisher")} basic />
  ) : null;

  return (
    <div
      className={
        style.item +
        (props.type === "Discussion" ? " " + style.discussion : "") +
        (props.publisher.id === appState.currentUser?.id ? " " + style.currentUser : "")
      }
    >
      {confirmDeleteDialog.element}
      {!isMobile && (
        <div className={style.avatar}>
          <UserLink user={props.publisher}>
            <UserAvatar imageSize={40} userAvatar={props.publisher.avatar} />
          </UserLink>
        </div>
      )}
      <div className={style.bubble + (pendingDelete ? " " + style.pending : "")}>
        <Header block attached="top" className={style.header}>
          <div className={style.headerContents}>
            <div className={style.left}>
              {!isMobile && <div className={style.triangle} />}
              {isMobile && (
                <div className={style.avatar}>
                  <UserLink user={props.publisher}>
                    <UserAvatar imageSize={20} userAvatar={props.publisher.avatar} />
                  </UserLink>
                </div>
              )}
              <div className={style.username}>
                <span>
                  <UserLink user={props.publisher} />
                </span>
              </div>
              <span className={style.commentedOn}>
                {_(".commented_on")}
                <AutoTimeAgoLabel time={props.publishTime} />
                {props.editTime && (
                  <>
                    <span className={style.edited} title={formatDateTime(props.editTime)[1]}>
                      {_(".edited")}
                    </span>
                  </>
                )}
              </span>
              {label && (
                <>
                  <div className={style.labelDivider} />
                  {label}
                </>
              )}
            </div>
            <div className={style.right}>
              {appState.currentUser && (
                <div className={style.actionIcon + (emojiPopupOpen ? " " + style.active : "")}>
                  <Popup
                    className={style.emojiPickerPopup}
                    trigger={<Icon name="smile outline" />}
                    content={
                      <ReactionEmojiPicker
                        currentUserReactions={props.reactions.currentUserReactions}
                        onSelectEmoji={emoji => {
                          onSelectEmoji(emoji);
                          setEmojiPopupOpen(false);
                        }}
                      />
                    }
                    open={emojiPopupOpen}
                    onOpen={() => setEmojiPopupOpen(true)}
                    onClose={() => setEmojiPopupOpen(false)}
                    on="click"
                    position={isMobile ? "right center" : "bottom center"}
                  />
                </div>
              )}
              {actions.length > 0 && (
                <Ref innerRef={refActionsMenuIcon}>
                  <Dropdown
                    direction={isMobile ? "left" : "right"}
                    className={style.actionIcon + (actionDropdownOpen ? " " + style.active : "")}
                    icon="ellipsis horizontal"
                    open={actionDropdownOpen}
                    // Click event issue
                    onOpen={() => !confirmSetPublicPopupOpen && !confirmDeletePopupOpen && setActionDropdownOpen(true)}
                    onClose={() => setActionDropdownOpen(false)}
                  >
                    <Dropdown.Menu>{actions}</Dropdown.Menu>
                  </Dropdown>
                </Ref>
              )}
            </div>
          </div>
        </Header>
        <Segment attached className={style.content}>
          <MarkdownContent content={props.content} />
        </Segment>
        {emojisAndCount.length > 0 && (
          <Segment attached="bottom" className={style.emojiList}>
            <div className={style.emojiListWrapper}>
              {emojisAndCount.map(([emoji, count]) => (
                <div
                  className={
                    style.emojiItem + (props.reactions.currentUserReactions.includes(emoji) ? " " + style.selected : "")
                  }
                  key={emoji}
                  onClick={() => onSelectEmoji(emoji)}
                >
                  <Emoji className={style.emoji} emoji={emoji} />
                  <PseudoLink className={style.link}>{count}</PseudoLink>
                </div>
              ))}
            </div>
          </Segment>
        )}
      </div>
    </div>
  );
};

interface DiscussionEditorProps {
  publisher: ApiTypes.UserMetaDto;
  content: string;
  type: "UpdateReply" | "NewReply" | "UpdateDiscussion" | "NewDiscussion";
  onChangeContent: (content: string) => void;
  onCancel?: () => void;
  onSubmit: (content: string) => Promise<boolean>;

  // Only for new/update discussion
  title?: string;
  onChangeTitle?: (title: string) => void;
  noSubmitPermission?: boolean;
}

export const DiscussionEditor: React.FC<DiscussionEditorProps> = props => {
  const _ = useLocalizer("discussion.edit");

  const isMobile = useScreenWidthWithin(0, 768);
  const [pendingSubmit, onSubmit] = useAsyncCallbackPending(async () => await props.onSubmit(props.content));

  const [preview, setPreview] = useState(false);

  const [editorFocused, setEditor] = useFocusWithin();

  const [modified, setModified] = useState(false);
  useConfirmUnload(() => modified);

  const isDiscussion = props.type === "NewDiscussion" || props.type === "UpdateDiscussion";
  const isUpdate = props.type === "UpdateDiscussion" || props.type === "UpdateReply";

  return (
    <div
      className={
        style.item +
        " " +
        style.edit +
        (props.publisher.id === appState.currentUser?.id ? " " + style.currentUser : "") +
        (!isUpdate ? " " + style.new : "") +
        (isDiscussion ? " " + style.discussion : "")
      }
    >
      {!isMobile && (
        <div className={style.avatar}>
          <UserLink user={props.publisher}>
            <UserAvatar imageSize={40} userAvatar={props.publisher.avatar} />
          </UserLink>
        </div>
      )}
      <div className={style.bubble + (editorFocused ? " " + style.editorFocused : "")}>
        <Header block attached="top" className={style.header}>
          {!isMobile && <div className={style.triangle} />}
          {isDiscussion && (
            <Input
              className={style.title}
              placeholder={_(".placeholder.title")}
              value={props.title}
              onChange={(e, { value }) => {
                if (!pendingSubmit) {
                  setModified(true);
                  props.onChangeTitle(value);
                }
              }}
            />
          )}
          <div className={style.headerContents}>
            <Menu attached="top" className={style.editTab} tabular>
              <Menu.Item active={!preview} onClick={() => setPreview(false)}>
                {_(".tabs.edit")}
              </Menu.Item>
              <Menu.Item active={preview} onClick={() => setPreview(true)}>
                {_(".tabs.preview")}
              </Menu.Item>
            </Menu>
          </div>
        </Header>
        <Segment attached className={style.mainSegment}>
          <Form style={preview ? { display: "none" } : {}}>
            <Ref innerRef={setEditor}>
              <TextArea
                as={TextAreaAutoSize}
                className={style.editor}
                maxRows={999}
                placeholder={
                  isUpdate
                    ? isDiscussion
                      ? _(".placeholder.update_discussion")
                      : _(".placeholder.update_reply")
                    : isDiscussion
                    ? _(".placeholder.add_discussion")
                    : _(".placeholder.add_reply")
                }
                value={props.content}
                onChange={(e, { value }) => {
                  if (!pendingSubmit) {
                    setModified(true);
                    props.onChangeContent(String(value));
                  }
                }}
              />
            </Ref>
          </Form>
          {preview && (
            <>
              <MarkdownContent className={style.preview} content={props.content} />
            </>
          )}
          <div className={style.actions}>
            {!isUpdate ? (
              <>
                <Button
                  positive
                  content={_(isDiscussion ? ".actions.add_discussion" : ".actions.add_reply")}
                  onClick={onSubmit}
                  loading={pendingSubmit}
                />
              </>
            ) : (
              <>
                <Button content={_(".actions.cancel")} onClick={props.onCancel} />
                <Button
                  positive
                  content={_(
                    isDiscussion
                      ? props.noSubmitPermission
                        ? ".actions.update_discussion_no_submit_permission"
                        : ".actions.update_discussion"
                      : ".actions.update_reply"
                  )}
                  onClick={async () => {
                    if (await onSubmit()) setModified(false);
                  }}
                  loading={pendingSubmit}
                  disabled={props.noSubmitPermission}
                />
              </>
            )}
          </div>
        </Segment>
      </div>
    </div>
  );
};

interface ReplyOrLoadMore {
  type: "Reply" | "LoadMore" | "EditReply";
  loadMore?: {
    afterId: number;
    beforeId: number;
    count: number;
    loading?: boolean;
  };
  reply?: ApiTypes.DiscussionReplyDto;
  editReplyContent?: string;
}

interface DiscussionViewPageProps {
  response: ApiTypes.GetDiscussionAndRepliesResponseDto;
}

let DiscussionViewPage: React.FC<DiscussionViewPageProps> = props => {
  const _ = useLocalizer("discussion");
  const navigation = useNavigation();

  useEffect(() => {
    appState.enterNewPage(
      `${getDiscussionDisplayTitle(props.response.discussion.meta.title, _)} - ${_(".title")}`,
      "discussion"
    );
  }, [appState.locale]);

  // Load LoadMore's background
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = `.${style.loadMore} { background-image: url(${loadMoreBackground}); }`;
    document.head.appendChild(styleElement);
    return () => document.head.removeChild(styleElement);
  });

  const stateItems = useState<ReplyOrLoadMore[]>(
    (() => {
      const head = props.response.repliesHead.map<ReplyOrLoadMore>(reply => ({
        type: "Reply",
        reply
      }));

      const tail = props.response.repliesTail.map<ReplyOrLoadMore>(reply => ({
        type: "Reply",
        reply
      }));

      const loadMoreCount = props.response.repliesTotalCount - head.length - tail.length;

      return [
        ...head,
        ...(loadMoreCount
          ? [
              {
                type: "LoadMore",
                loadMore: {
                  afterId: head[head.length - 1].reply.id,
                  beforeId: tail[0].reply.id,
                  count: loadMoreCount
                }
              } as ReplyOrLoadMore
            ]
          : []),
        ...tail
      ];
    })()
  );
  const [items, setItems] = stateItems;
  const refStateItems = useRef<typeof stateItems>();
  refStateItems.current = stateItems;

  function mergeLoadMoreItem(
    afterId: number,
    callbackOrItem:
      | Partial<ReplyOrLoadMore["loadMore"]>
      | ((item: ReplyOrLoadMore["loadMore"]) => Partial<ReplyOrLoadMore["loadMore"]>)
  ) {
    const [items, setItems] = refStateItems.current;
    setItems(
      items.map(item =>
        item.loadMore?.afterId === afterId
          ? Object.assign({}, item, {
              loadMore: Object.assign(
                {},
                item.loadMore,
                typeof callbackOrItem === "function" ? callbackOrItem(item.loadMore) : callbackOrItem
              )
            })
          : item
      )
    );
  }

  async function onLoadMore(item: ReplyOrLoadMore) {
    if (item.loadMore.loading) return;
    mergeLoadMoreItem(item.loadMore.afterId, { loading: true });

    const { requestError, response } = await DiscussionApi.getDiscussionAndReplies({
      locale: appState.locale,
      queryRepliesType: "IdRange",
      discussionId: discussion.meta.id,
      afterId: item.loadMore.afterId,
      beforeId: item.loadMore.beforeId,
      idRangeTakeCount: Math.min(item.loadMore.count, appState.serverPreference.pagination.discussionRepliesMore)
    });

    if (requestError) toast.error(requestError(_));
    else if (response.error) toast.error(_(`.errors.${response.error}`));
    else {
      const [items, setItems] = refStateItems.current;
      const newItems: ReplyOrLoadMore[] = [];
      for (const i of items.keys()) {
        if (items[i].loadMore?.afterId !== item.loadMore.afterId) {
          newItems.push(items[i]);
          continue;
        }

        if (response.repliesCountInRange === 0) continue;

        for (const reply of response.repliesInRange)
          newItems.push({
            type: "Reply",
            reply
          });

        const loadedCount = response.repliesInRange.length;
        if (response.repliesCountInRange > loadedCount) {
          newItems.push({
            type: "LoadMore",
            loadMore: {
              afterId: response.repliesInRange[loadedCount - 1].id,
              beforeId: item.loadMore.beforeId,
              count: response.repliesCountInRange - loadedCount
            }
          });
        }
      }
      setItems(newItems);

      return;
    }

    mergeLoadMoreItem(item.loadMore.afterId, { loading: false });
  }

  const stateDiscussion = useState(props.response.discussion);
  const [discussion, setDiscussion] = stateDiscussion;
  const refStateDiscussion = useRef<typeof stateDiscussion>();
  refStateDiscussion.current = stateDiscussion;

  function mergeDiscussion(callback: (discussion: ApiTypes.DiscussionDto) => Partial<ApiTypes.DiscussionDto>) {
    const [discussion, setDiscussion] = refStateDiscussion.current;
    setDiscussion(Object.assign({}, discussion, callback(discussion)));
  }

  function mergeItem(
    id: number,
    callbackOrItem: Partial<ReplyOrLoadMore> | ((item: ReplyOrLoadMore) => Partial<ReplyOrLoadMore>)
  ) {
    const [items, setItems] = refStateItems.current;
    setItems(
      items.map(item =>
        item.reply && item.reply.id === id
          ? Object.assign({}, item, typeof callbackOrItem === "function" ? callbackOrItem(item) : callbackOrItem)
          : item
      )
    );
  }

  function mergeReplyItem(
    id: number,
    callbackOrItem:
      | Partial<ApiTypes.DiscussionReplyDto>
      | ((item: ApiTypes.DiscussionReplyDto) => Partial<ApiTypes.DiscussionReplyDto>)
  ) {
    mergeItem(id, item =>
      Object.assign({}, item, {
        reply: Object.assign(
          {},
          item.reply,
          typeof callbackOrItem === "function" ? callbackOrItem(item.reply) : callbackOrItem
        )
      })
    );
  }

  async function onReaction(type: "Discussion" | "DiscussionReply", id: number, emoji: string, reaction: boolean) {
    if (!appState.currentUser) return;

    const { requestError, response } = await DiscussionApi.toggleReaction({
      type,
      id,
      emoji,
      reaction
    });

    if (requestError) toast.error(requestError(_));
    else if (response.error) toast.error(_(`.errors.${response.error}`));
    else {
      function processReactions(reactions: ApiTypes.DiscussionOrReplyReactionsDto) {
        return {
          count: Object.assign({}, reactions.count, {
            [emoji]: (reaction ? 1 : -1) + (Number(reactions.count[emoji]) || 0)
          }),
          currentUserReactions: reaction
            ? reactions.currentUserReactions.concat(emoji)
            : reactions.currentUserReactions.filter(s => s !== emoji)
        };
      }

      if (type === "Discussion") {
        mergeDiscussion(discussion => ({
          reactions: processReactions(discussion.reactions)
        }));
      } else {
        mergeReplyItem(id, reply => ({
          reactions: processReactions(reply.reactions)
        }));
      }
    }
  }

  async function onSetPublic(type: "Discussion" | "DiscussionReply", id: number, isPublic: boolean) {
    const { requestError, response } = await (type === "Discussion"
      ? DiscussionApi.setDiscussionPublic
      : DiscussionApi.setDiscussionReplyPublic)({
      [type === "Discussion" ? "discussionId" : "discussionReplyId"]: id,
      isPublic
    } as any);

    if (requestError) toast.error(requestError(_));
    else if (response.error) toast.error(_(`.errors.${response.error}`));
    else {
      if (type === "Discussion") {
        mergeDiscussion(({ meta }) => ({
          meta: Object.assign({}, meta, { isPublic })
        }));
      } else {
        mergeReplyItem(id, {
          isPublic
        });
      }
    }
  }

  async function onDelete(type: "Discussion" | "DiscussionReply", id: number) {
    const { requestError, response } = await (type === "Discussion"
      ? DiscussionApi.deleteDiscussion
      : DiscussionApi.deleteDiscussionReply)({
      [type === "Discussion" ? "discussionId" : "discussionReplyId"]: id
    } as any);

    if (requestError) toast.error(requestError(_));
    else if (response.error) toast.error(_(`.errors.${response.error}`));
    else {
      if (type === "Discussion") {
        navigation.navigate({
          pathname: "/discussions",
          query: discussion.problem
            ? {
                problemId: String(discussion.problem.meta.id)
              }
            : null
        });
      } else {
        const [items, setItems] = refStateItems.current;
        setItems(items.filter(item => item.reply?.id !== id));
      }
    }
  }

  const [newReplyContent, setNewReplyContent] = useState("");
  async function onAddNewReply(content: string) {
    const { requestError, response } = await DiscussionApi.createDiscussionReply({
      discussionId: discussion.meta.id,
      content: content
    });

    if (requestError) toast.error(requestError(_));
    else if (response.error) toast.error(_(`.errors.${response.error}`));
    else {
      const [items, setItems] = refStateItems.current;
      setItems([
        ...items,
        {
          type: "Reply",
          reply: response.reply
        }
      ]);
      setNewReplyContent("");

      return true;
    }

    return false;
  }

  function onEnterEdit(id: number) {
    mergeItem(id, item => ({
      type: "EditReply",
      editReplyContent: item.reply.content
    }));
  }

  function onCancelEdit(id: number) {
    mergeItem(id, () => ({
      type: "Reply"
    }));
  }

  async function onUpdateReply(id: number, content: string) {
    const { requestError, response } = await DiscussionApi.updateDiscussionReply({
      discussionReplyId: id,
      content
    });

    if (requestError) toast.error(requestError(_));
    else if (response.error) toast.error(_(`.errors.${response.error}`));
    else {
      mergeItem(id, item => ({
        type: "Reply",
        reply: Object.assign({}, item.reply, { content, editTime: response.editTime })
      }));

      return true;
    }

    return false;
  }

  function onQuote(username: string, text: string) {
    let content = newReplyContent;
    if (content) {
      if (content.endsWith("\n")) content = content.slice(0, -1);
      if (content.endsWith("\n")) content = content.slice(0, -1);
      content += "\n\n";
    }
    setNewReplyContent(
      content +
        `> @${username}:\n>\n` +
        text
          .trimEnd()
          .split("\n")
          .map(line => `> ${line}`.trimRight())
          .join("\n") +
        "\n\n"
    );
  }

  const refOpenPermissionManager = useRef<() => Promise<boolean>>();
  const permissionManager = (
    <PermissionManager
      objectDescription={_(".permission_manager_description", { id: discussion.meta.id })}
      permissionsLevelDetails={{
        1: {
          title: _(".permission_level.read")
        },
        2: {
          title: _(".permission_level.write")
        }
      }}
      refOpen={refOpenPermissionManager}
      onGetInitialPermissions={async () => {
        const { requestError, response } = await DiscussionApi.getDiscussionPermissions({
          id: discussion.meta.id
        });
        if (requestError) toast.error(requestError(_));
        else if (response.error) toast.error(_(`.error.${response.error}`));
        else {
          return {
            owner: discussion.publisher,
            userPermissions: response.permissions.userPermissions,
            groupPermissions: response.permissions.groupPermissions,
            haveSubmitPermission: response.haveManagePermissionsPermission
          };
        }
        return null;
      }}
      onSubmitPermissions={async (userPermissions, groupPermissions) => {
        const { requestError, response } = await DiscussionApi.setDiscussionPermissions({
          discussionId: discussion.meta.id,
          userPermissions: userPermissions as any,
          groupPermissions: groupPermissions as any
        });
        if (requestError) toast.error(requestError(_));
        else if (response.error === "NO_SUCH_DISCUSSION") toast.error(_(".errors.NO_SUCH_DISCUSSION"));
        else if (response.error) return response;
        return true;
      }}
    />
  );

  const actions = props.response.permissionCreateNewDiscussion && (
    <Button
      primary
      className="labeled icon"
      icon="plus"
      content={_(".add_discussion")}
      as={Link}
      href={getNewDiscussionUrl(discussion.problem?.meta?.id)}
    />
  );

  const isMobile = useScreenWidthWithin(0, 768);

  return (
    <>
      {permissionManager}
      {getBreadcrumb(discussion.problem, _)}
      <div className={style.titleAndActions}>
        <div className={style.title}>
          <Header size="large" content={getDiscussionDisplayTitle(discussion.meta.title, _)} />
          <span className={style.replyCount}>
            {_(
              discussion.meta.replyCount === 0
                ? ".reply_count_0"
                : discussion.meta.replyCount === 1
                ? ".reply_count"
                : ".reply_count_s",
              {
                replyCount: discussion.meta.replyCount
              }
            )}
          </span>
        </div>
        {!isMobile && <div className={style.actions}>{actions}</div>}
      </div>
      <div className={style.items + (isMobile ? " " + style.mobile : "")}>
        <DiscussionItem
          type="Discussion"
          discussion={discussion}
          content={discussion.content}
          isPublic={discussion.meta.isPublic}
          reactions={discussion.reactions}
          publisher={discussion.publisher}
          publishTime={new Date(discussion.meta.publishTime)}
          editTime={discussion.meta.editTime && new Date(discussion.meta.editTime)}
          permission={discussion.permissions}
          onReaction={async (emoji: string, reaction: boolean) =>
            await onReaction("Discussion", discussion.meta.id, emoji, reaction)
          }
          onSetPublic={() => onSetPublic("Discussion", discussion.meta.id, !discussion.meta.isPublic)}
          onManagePermission={() => refOpenPermissionManager.current && refOpenPermissionManager.current()}
          onEnterEdit={`/discussion/${discussion.meta.id}/edit`}
          onDelete={async () => await onDelete("Discussion", discussion.meta.id)}
        />
        {items.map((item, i) =>
          item.type === "EditReply" ? (
            <DiscussionEditor
              key={item.reply.id}
              publisher={item.reply.publisher}
              content={item.editReplyContent}
              type="UpdateReply"
              onCancel={() => onCancelEdit(item.reply.id)}
              onChangeContent={content => mergeItem(item.reply.id, { editReplyContent: content })}
              onSubmit={content => onUpdateReply(item.reply.id, content)}
            />
          ) : item.type === "Reply" ? (
            <DiscussionItem
              key={item.reply.id}
              type="Reply"
              discussion={discussion}
              content={item.reply.content}
              isPublic={item.reply.isPublic}
              reactions={item.reply.reactions}
              publisher={item.reply.publisher}
              publishTime={new Date(item.reply.publishTime)}
              editTime={item.reply.editTime && new Date(item.reply.editTime)}
              permission={item.reply.permissions}
              onReaction={async (emoji: string, reaction: boolean) =>
                await onReaction("DiscussionReply", item.reply.id, emoji, reaction)
              }
              onQuote={() => onQuote(item.reply.publisher.username, item.reply.content)}
              onSetPublic={() => onSetPublic("DiscussionReply", item.reply.id, !item.reply.isPublic)}
              onEnterEdit={() => onEnterEdit(item.reply.id)}
              onDelete={async () => await onDelete("DiscussionReply", item.reply.id)}
            />
          ) : (
            <div key={`LoadMore${i}`} className={style.loadMore}>
              <div>
                {_(item.loadMore.count === 1 ? ".load_more.hidden_count" : ".load_more.hidden_count_s", {
                  count: item.loadMore.count
                })}
                <PseudoLink onClick={() => onLoadMore(item)}>{_(".load_more.load_more")}</PseudoLink>
              </div>
            </div>
          )
        )}
        {appState.currentUser && (
          <>
            {!isMobile && <div className={style.dividerBeforeAddReply} />}
            <DiscussionEditor
              publisher={appState.currentUser}
              content={newReplyContent}
              type="NewReply"
              onChangeContent={setNewReplyContent}
              onSubmit={onAddNewReply}
            />
          </>
        )}
      </div>
    </>
  );
};

DiscussionViewPage = observer(DiscussionViewPage);

export default defineRoute(async request => {
  const discussionId = Number(request.params.id) || 0;
  const response = await fetchData(discussionId);
  return <DiscussionViewPage response={response} />;
});