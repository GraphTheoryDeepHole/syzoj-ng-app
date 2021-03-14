import { Comment, Header, Placeholder, Segment } from "semantic-ui-react";
import MarkdownContent from "@/markdown/MarkdownContent";
import React, { useState } from "react";
import style from "./AlgorithmSteps.module.less";
import { codeMap } from "@/pages/graph-editor/algorithms";

interface AlgorithmStepsProps {
  algorithmName: string,
  codeType: string
  codePosition: number,
}

const AlgorithmSteps: React.FC<AlgorithmStepsProps> = props => {
  const { algorithmName, codeType, codePosition } = props;

  const mapCodeLines = (outerIndexes: number[]) => (e, i) => (
    <Comment key={i}>
      {typeof e === "string" ? (
        <>
          <Comment.Text
            className={
              codePosition === i ? style.currentStep : style.step
            }
          >
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
        {algorithmName != null && codeType != null ? (
          <Comment.Group>{codeMap[algorithmName][codeType].map(mapCodeLines([]))}</Comment.Group>
        ) : (
          <Placeholder fluid>
            {Array.from({ length: 7 }, (_, i) => (
              <Placeholder.Line key={i} />
            ))}
          </Placeholder>
        )}
      </Segment>
    </>
  );
};

export default React.memo(AlgorithmSteps);