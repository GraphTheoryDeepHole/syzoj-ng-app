import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { Link, useNavigation, useLoadingRoute } from "react-navi";
import { Menu, Button, Dropdown, Container, Icon, Segment, Sidebar, SemanticICONS } from "semantic-ui-react";

import "typeface-lato";
import "typeface-saira";
import "semantic-ui-css/semantic.css";
import "noty/lib/noty.css";
import "noty/lib/themes/semanticui.css";

import style from "./AppLayout.module.less";
import Logo from "@/assets/syzoj-applogo.svg";

import GlobalProgressBar from "@/components/GlobalProgressBar";

import { Locale } from "@/interfaces/Locale";
import localeMeta from "@/locales/meta";
import { appState } from "@/appState";
import { useIntlMessage, useLoginOrRegisterNavigation } from "@/utils/hooks";
import toast from "@/utils/toast";
import { AuthApi } from "@/api";
import { useScreenWidthWithin } from "@/utils/hooks/useScreenWidthWithin";

export type NavButtonName = "home" | "problem_set" | "contests" | "submissions" | "members" | "discussion";

let AppLayout: React.FC = props => {
  const navigation = useNavigation();
  const loadingRoute = useLoadingRoute();
  const _ = useIntlMessage("common");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (sidebarOpen !== document.documentElement.classList.contains(style.sidebarOpen))
      document.documentElement.classList.toggle(style.sidebarOpen);
  }, [sidebarOpen]);

  useEffect(() => {
    const subscription = navigation.subscribe(route => {
      if (route.type === "ready") {
        setSidebarOpen(false);

        // Reset the scroll position to the top
        // Notice that the scroll position won't be back after "Go back" operation in browser (i.e. history popstate)
        document.body.scrollTop = 0;
      }
    });

    return () => subscription.unsubscribe();
  });

  async function onLogoutClick() {
    const { requestError, response } = await AuthApi.logout();
    if (requestError) {
      toast.error(requestError);
    } else {
      appState.token = appState.currentUser = null;
      appState.currentUserPrivileges = [];
      appState.userPreference = {};
      navigation.refresh();
    }
  }

  const onLoginOrRegisterClick = useLoginOrRegisterNavigation();

  const navButtons: Record<NavButtonName, { icon: SemanticICONS; text: string; url?: string }> = {
    home: {
      icon: "home",
      text: ".navbar.home",
      url: "/"
    },
    problem_set: {
      icon: "book",
      text: ".navbar.problem_set",
      url: "/problems"
    },
    contests: {
      icon: "calendar",
      text: ".navbar.contests"
      // url: "/contests"
    },
    submissions: {
      icon: "hourglass",
      text: ".navbar.submissions",
      url: "/submissions"
    },
    members: {
      icon: "users",
      text: ".navbar.members",
      url: "/users"
    },
    discussion: {
      icon: "comments",
      text: ".navbar.discussion"
      // url: "/discussion"
    }
  };

  const navMenuItems = Object.keys(navButtons).map(name => (
    <Menu.Item key={name} as={Link} href={navButtons[name].url} active={appState.activeNavButton === name}>
      <Icon name={navButtons[name].icon} />
      {_(navButtons[name].text)}
    </Menu.Item>
  ));

  const loginAndRegisterButtons = (
    <>
      <Button className={style.loginAndRegisterButton} onClick={() => onLoginOrRegisterClick("login")}>
        {_(".header.user.login")}
      </Button>
      <Button
        className={style.loginAndRegisterButton}
        primary
        onClick={() => onLoginOrRegisterClick("register")}
        type="primary"
      >
        {_(".header.user.register")}
      </Button>
    </>
  );

  const userMenu = (ContainerComponent: typeof Dropdown | typeof Menu) => (
    <>
      <ContainerComponent.Menu className={style.userMenu}>
        <ContainerComponent.Item as={Link} href={`/user/${appState.currentUser.id}`}>
          <Icon name="user" />
          {_(".header.user.profile")}
        </ContainerComponent.Item>
        <ContainerComponent.Item
          as={Link}
          href={{ pathname: "/submissions", query: { submitter: appState.currentUser.username } }}
        >
          <Icon name="hourglass half" />
          {_(".header.user.submissions")}
        </ContainerComponent.Item>
        <ContainerComponent.Item
          as={Link}
          href={{ pathname: "/problems", query: { ownerId: appState.currentUser.id } }}
        >
          <Icon name="book" />
          {_(".header.user.problems")}
        </ContainerComponent.Item>
        {appState.currentUserJoinedGroupsCount > 0 && (
          <ContainerComponent.Item as={Link} href="/users/groups">
            <Icon name="users" />
            {_(".header.user.groups")}
          </ContainerComponent.Item>
        )}
        {ContainerComponent === Dropdown && <Dropdown.Divider />}
        <ContainerComponent.Item as={Link} href={`/user/${appState.currentUser.id}/edit/profile`}>
          <Icon name="edit" />
          {_(".header.user.edit_profile")}
        </ContainerComponent.Item>
        <ContainerComponent.Item as={Link} href={`/user/${appState.currentUser.id}/edit/preference`}>
          <Icon name="cog" />
          {_(".header.user.preference")}
        </ContainerComponent.Item>
        <ContainerComponent.Item onClick={onLogoutClick}>
          <Icon name="power" />
          {_(".header.user.logout")}
        </ContainerComponent.Item>
      </ContainerComponent.Menu>
    </>
  );

  const logo = (
    <Menu.Item as={Link} href="/" className={style.logoItem}>
      <div className={style.content}>
        <div className={style.logo}>
          <Logo />
        </div>
        <div className={style.siteName}>{appState.serverPreference.siteName}</div>
      </div>
    </Menu.Item>
  );

  const footer = (
    <>
      <Segment vertical className={style.footer}>
        <Container textAlign="center">
          <div>
            {appState.serverPreference.siteName} Powered by{" "}
            <a href="https://github.com/syzoj" target="_blank">
              SYZOJ
            </a>
          </div>
          <div className={style.footerLinks}>
            <Link href="/judge-machine">{_(".footer.judge_machine")}</Link>
          </div>
          <div className={style.languageSwitchContainer}>
            <Dropdown icon="language">
              <Dropdown.Menu className={style.languageSwitchMenu}>
                {Object.keys(localeMeta).map((locale: Locale) => (
                  <Dropdown.Item
                    key={locale}
                    onClick={() => {
                      appState.localLocale = locale;
                      navigation.refresh();
                    }}
                    flag={localeMeta[locale].flag}
                    text={localeMeta[locale].name}
                    value={locale}
                    selected={locale === appState.locale}
                  />
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Container>
      </Segment>
    </>
  );

  const userDropdown = (icon: boolean = true) => (
    <Menu.Menu position="right">
      <div className="ui simple dropdown item">
        {appState.currentUser.username}
        {icon && <i className="dropdown icon"></i>}
        {userMenu(Dropdown)}
      </div>
    </Menu.Menu>
  );

  const topBarItemsForWideScreen = (
    <>
      {navMenuItems}
      {appState.currentUser ? (
        userDropdown()
      ) : (
        <Menu.Item className={style.userContainer}>{loginAndRegisterButtons}</Menu.Item>
      )}
    </>
  );

  const topBarItemsForNarrowScreen = (
    <Menu.Menu position="right">
      {appState.currentUser && userDropdown(false)}
      <Menu.Item icon="bars" onClick={() => setSidebarOpen(true)} />
    </Menu.Menu>
  );

  const wide = useScreenWidthWithin(1024, Infinity);

  const sidebarOpenStatusClassName = sidebarOpen ? " " + style.sidebarOpen : "";

  return (
    <>
      <GlobalProgressBar isAnimating={!!loadingRoute} />
      <Menu borderless fixed="top" className={style.menu}>
        <Container id={style.mainMenuContainer}>
          {logo}
          {wide ? topBarItemsForWideScreen : topBarItemsForNarrowScreen}
        </Container>
      </Menu>
      <Container id={style.mainUiContainer}>{props.children}</Container>
      {footer}
      {!wide && (
        <>
          <div className={style.sidebarDimmer + sidebarOpenStatusClassName} onClick={() => setSidebarOpen(false)}></div>
          <Sidebar
            as={Menu}
            className={style.sidebarMenu + sidebarOpenStatusClassName}
            animation="push"
            direction="right"
            vertical
            visible
          >
            <Menu.Item className={style.siteName} as={Link} href="/">
              {appState.serverPreference.siteName}
            </Menu.Item>
            <Menu.Item>
              {appState.currentUser ? (
                <>
                  <Menu.Header>{appState.currentUser.username}</Menu.Header>
                  {userMenu(Menu)}
                </>
              ) : (
                <Button.Group fluid>{loginAndRegisterButtons}</Button.Group>
              )}
            </Menu.Item>
            {navMenuItems}
          </Sidebar>
        </>
      )}
    </>
  );
};

AppLayout = observer(AppLayout);

export default AppLayout;
