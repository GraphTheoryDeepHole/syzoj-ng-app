import { Comment, Header, Icon, Segment } from "semantic-ui-react";
import MarkdownContent from "@/markdown/MarkdownContent";
import React from "react";
import style from "./AlgorithmSteps.module.less";
import { codeMap } from "@/pages/graph-editor/algorithms";
import { useLocalizer } from "@/utils/hooks";

interface AlgorithmStepsProps {
  algorithmName: string;
  codeType: string;
  codePosition: number;
}

const AlgorithmSteps: React.FC<AlgorithmStepsProps> = props => {
  const _ = useLocalizer("graph_editor");
  const { algorithmName, codeType, codePosition } = props;

  const mapCodeLines = (outerIndexes: number[]) => (e, i) => (
    <Comment key={i}>
      {typeof e === "string" ? (
        <>
          <Comment.Text className={codePosition === i ? style.currentStep : style.step}>
            <MarkdownContent content={e} />
          </Comment.Text>
        </>
      ) : (
        <Comment.Group>{e.map(mapCodeLines([...outerIndexes, i]))}</Comment.Group>
      )}
    </Comment>
  );

  return (
    <>
      <Header as="h4" block attached="top" icon="code" content="code" />
      <Segment attached="bottom">
        {algorithmName && codeType ? (
          <Comment.Group>{codeMap[algorithmName][codeType].map(mapCodeLines([]))}</Comment.Group>
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
