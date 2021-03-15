import React, { useEffect, useState } from "react";
import { useLocalizer, useScreenWidthWithin } from "@/utils/hooks";
import { appState } from "@/appState";
import GraphDisplay from "./ui/GraphDisplay";
import GraphInputPanel from "./ui/GraphInputPanel";
import { fromRandom, Graph } from "@/pages/graph-editor/GraphStructure";
import AlgorithmControl from "@/pages/graph-editor/ui/AlgorithmControl";
import { route } from "navi";
import { newAlgorithm } from "@/pages/graph-editor/algorithms";
import cloneDeep from "lodash.clonedeep";
import {
  EdgeRenderHint,
  GeneralRenderHint,
  GraphRenderType,
  NodeRenderHint
} from "@/pages/graph-editor/ui/CanvasGraphRenderer";
import { Grid } from "semantic-ui-react";
import AlgorithmSteps from "@/pages/graph-editor/ui/AlgorithmSteps";

let GraphEditor: React.FC = props => {
  let g = fromRandom(10, 15, true, false, false, false);

  // TODO: use context
  const [dataGraph, setDataGraph] = useState<Graph>(cloneDeep(g));
  const [displayGraph, setDisplayGraph] = useState<Graph>();
  const [renderType, setRenderType] = useState<GraphRenderType>();
  const [generalRenderHint, setGeneralRenderHint] = useState<GeneralRenderHint>();
  const [nodeRenderHint, setNodeRenderHint] = useState<Partial<NodeRenderHint>>();
  const [edgeRenderHint, setEdgeRenderHint] = useState<Partial<EdgeRenderHint>>();
  const [algorithmName, setAlgorithmName] = useState<string>();
  const [codeType, setCodeType] = useState<string>();
  const [codePosition, setCodePosition] = useState<number>();

  const _ = useLocalizer("graph_editor");

  useEffect(() => {
    appState.enterNewPage(_(".title"), "graph_editor");
  }, [appState.locale]);

  const onAlgorithmChanged = newName => {
    const algo = newAlgorithm(newName);
    setAlgorithmName(newName);
    if (algo) {
      setNodeRenderHint(algo.nodeRenderPatcher());
      setEdgeRenderHint(algo.edgeRenderPatcher());
    } else {
      setNodeRenderHint({});
      setEdgeRenderHint({});
    }
  };

  const onGraphInput = useCallback(graph => setDataGraph(cloneDeep(graph)), [setDataGraph]);
  const onAlgorithmGraph = useCallback(graph => setDisplayGraph(cloneDeep(graph)), [setDisplayGraph]);

  const isNarrowScreen = useScreenWidthWithin(0, 1024);

  const graphInputPanel = () => (
    <GraphInputPanel graph={dataGraph} renderType={renderType} setRenderType={setRenderType} setGraph={onGraphInput} />
  );
  const graphDisplay = () => (
    <GraphDisplay
      dataGraph={dataGraph}
      renderType={renderType}
      displayedGraph={displayGraph}
      generalRenderHint={generalRenderHint}
      nodeRenderHint={nodeRenderHint}
      edgeRenderHint={edgeRenderHint}
    />
  );
  const algorithmControl = () => (
    <AlgorithmControl
      dataGraph={dataGraph}
      setDisplayedGraph={onAlgorithmGraph}
      setCodeType={setCodeType}
      setCodePosition={setCodePosition}
      onAlgorithmChanged={onAlgorithmChanged}
    />
  );
  const algorithmSteps = () => (
    <AlgorithmSteps algorithmName={algorithmName} codeType={codeType} codePosition={codePosition} />
  );

  return isNarrowScreen ? (
    <>
      {graphInputPanel()}
      {graphDisplay()}
      {algorithmControl()}
      {algorithmSteps()}
    </>
  ) : (
    <Grid>
      <Grid.Column width={11}>
        {graphInputPanel()}
        {graphDisplay()}
        {algorithmSteps()}
      </Grid.Column>
      <Grid.Column width={5}>{algorithmControl()}</Grid.Column>
    </Grid>
  );
};

export default route({ view: <GraphEditor /> });
