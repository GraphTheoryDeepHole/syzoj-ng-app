import React, { useEffect, useState } from "react";
import { useLocalizer } from "@/utils/hooks";
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
  const [dataGraph, setDataGraph] = useState(g);
  const [controlGraph, setControlGraph] = useState(g);
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

  useEffect(() => {
    setControlGraph(cloneDeep(dataGraph));
  }, [dataGraph]);

  useEffect(() => {
    if (displayGraph == null) setControlGraph(cloneDeep(dataGraph));
  }, [displayGraph]);

  const onAlgorithmChanged = newName => {
    const algo = newAlgorithm(newName);
    setAlgorithmName(newName);
    setNodeRenderHint(algo.nodeRenderPatcher());
    setEdgeRenderHint(algo.edgeRenderPatcher());
  };

  return (
    <>
      <Grid>
        <Grid.Column width={11}>
          <GraphInputPanel
            graph={dataGraph}
            renderType={renderType}
            setRenderType={rt => setRenderType(rt)}
            setGraph={g => setDataGraph(g)}
          />
          <GraphDisplay
            dataGraph={dataGraph}
            renderType={renderType}
            displayedGraph={displayGraph}
            generalRenderHint={generalRenderHint}
            nodeRenderHint={nodeRenderHint}
            edgeRenderHint={edgeRenderHint}
          />
          <AlgorithmSteps
            algorithmName={algorithmName}
            codeType={codeType}
            codePosition={codePosition}
          />
        </Grid.Column>
        <Grid.Column width={5}>
          <AlgorithmControl
            dataGraph={controlGraph}
            setDisplayedGraph={g => setDisplayGraph(g)}
            setCodeType = {type => setCodeType(type)}
            setCodePosition = {pos => setCodePosition(pos)}
            onAlgorithmChanged={onAlgorithmChanged}
          />
        </Grid.Column>
      </Grid>
    </>
  );
};

export default route({ view: <GraphEditor /> });
