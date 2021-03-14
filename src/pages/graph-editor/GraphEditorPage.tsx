import React, { useEffect, useState } from "react";
import { useLocalizer } from "@/utils/hooks";
import { appState } from "@/appState";
import GraphDisplay from "./display/GraphDisplay";
import GraphInputPanel from "./input/GraphInputPanel";
import { fromRandom, Graph } from "@/pages/graph-editor/GraphStructure";
import AlgorithmControl from "@/pages/graph-editor/control/AlgorithmControl";
import { route } from "navi";
import { newAlgorithm } from "@/pages/graph-editor/algorithms";
import cloneDeep from "lodash.clonedeep";
import {
  EdgeRenderHint,
  GeneralRenderHint,
  GraphRenderType,
  NodeRenderHint
} from "@/pages/graph-editor/display/CanvasGraphRenderer";

let GraphEditor: React.FC = props => {
  let g = fromRandom(10, 15, true, false, false, false);

  const [dataGraph, setDataGraph] = useState(g);
  const [controlGraph, setControlGraph] = useState(g);
  const [displayGraph, setDisplayGraph] = useState<Graph>();
  const [renderType, setRenderType] = useState<GraphRenderType>();
  const [generalRenderHint, setGeneralRenderHint] = useState<GeneralRenderHint>();
  const [nodeRenderHint, setNodeRenderHint] = useState<Partial<NodeRenderHint>>();
  const [edgeRenderHint, setEdgeRenderHint] = useState<Partial<EdgeRenderHint>>();

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
    setNodeRenderHint(algo.nodeRenderPatcher());
    setEdgeRenderHint(algo.edgeRenderPatcher());
  };

  return (
    <>
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
      <AlgorithmControl
        dataGraph={controlGraph}
        setDisplayedGraph={g => setDisplayGraph(g)}
        onAlgorithmChanged={onAlgorithmChanged}
      />
    </>
  );
};

export default route({ view: <GraphEditor /> });
