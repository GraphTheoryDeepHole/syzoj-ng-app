import { Comment, Header, Icon, Segment } from "semantic-ui-react";
import MarkdownContent from "@/markdown/MarkdownContent";
import React from "react";
import style from "./AlgorithmSteps.module.less";
import { codeMap } from "@/pages/graph-editor/algorithms";
import { useLocalizer } from "@/utils/hooks";
import headerStyle from "@/pages/graph-editor/ui/HeaderIconSizePatcher";

interface AlgorithmStepsProps {
  algorithmName: string;
  codeType: string;
  codePosition: number;
}

const AlgorithmSteps: React.FC<AlgorithmStepsProps> = props => {
  const _ = useLocalizer("graph_editor");
  const { algorithmName, codeType, codePosition } = props;

  const renderCodeLines: (element: (string | string[])[], idx?: number) => [JSX.Element[], number] = (
    element,
    idx = 0
  ) => {
    let ans: JSX.Element[] = [];
    for (let line of element) {
      if (typeof line === "string") {
        ans.push(
          <Comment.Text key={idx} className={codePosition === idx ? style.currentStep : style.step}>
            <MarkdownContent content={line} />
          </Comment.Text>
        );
        ++idx;
      } else {
        let rec = renderCodeLines(line, idx);
        ans.push(<Comment.Group key={idx}>{rec[0]}</Comment.Group>);
        idx += rec[1];
      }
    }
    return [ans, idx];
  };

  return (
    <>
      <Header as="h4" className={headerStyle} block attached="top" icon="code" content={_(".ui.code_display")} />
      <Segment attached="bottom">
        {algorithmName && codeType ? (
          <Comment.Group>{renderCodeLines(codeMap[algorithmName][codeType])[0]}</Comment.Group>
        ) : (
          <Segment placeholder>
            <Header icon>
              <Icon name="question circle outline" />
              {_(".ui.no_codetype")}
            </Header>
          </Segment>
        )}
      </Segment>
    </>
  );
};

export default React.memo(AlgorithmSteps);
