import React, { useEffect, useState } from "react";
import { useLocalizer } from "@/utils/hooks";
import { appState } from "@/appState";
import GraphDisplay from "./display/GraphDisplay";
import GraphInputPanel from "./input/GraphInputPanel";
import { fromRandom, Graph } from "@/pages/graph-editor/GraphStructure";
import AlgorithmControl from "@/pages/graph-editor/control/AlgorithmControl";
import { route } from "navi";
import { newAlgorithm } from "@/pages/graph-editor/algorithms";
import { EdgeRenderHint, GeneralRenderHint, NodeRenderHint } from "@/pages/graph-editor/display/CanvasGraphRenderer";


let GraphEditor: React.FC = props => {
  let g = fromRandom(10, 15, true, false, false, false);

  const cssProp = (key: string) => getComputedStyle(document.body).getPropertyValue(key);

  const [dataGraph, setDataGraph] = useState(g);
  const [displayGraph, setDisplayGraph] = useState<Graph>();
  const [generalRenderHint, setGeneralRenderHint] = useState<GeneralRenderHint>();
  const [nodeRenderHint, setNodeRenderHint] = useState<Partial<NodeRenderHint>>();
  const [edgeRenderHint, setEdgeRenderHint] = useState<Partial<EdgeRenderHint>>();

  const _ = useLocalizer("graph_editor");

  useEffect(() => {
    appState.enterNewPage(_(".title"), "graph_editor");
  }, [appState.locale]);

  const onAlgorithmChanged = newName => {
    const algo = newAlgorithm(newName);
    setNodeRenderHint(algo.nodeRenderPatcher());
    setEdgeRenderHint(algo.edgeRenderPatcher());
  };

  return (
    <>
      <GraphInputPanel graph={dataGraph} setGraph={g => setDataGraph(g)} />
      <GraphDisplay
        dataGraph={dataGraph}
        displayedGraph={displayGraph}
        generalRenderHint={generalRenderHint}
        nodeRenderHint={nodeRenderHint}
        edgeRenderHint={edgeRenderHint}
      />
      <AlgorithmControl dataGraph={dataGraph} setDisplayedGraph={g => setDisplayGraph(g)}
                        onAlgorithmChanged={onAlgorithmChanged} />
    </>
  );
};

export default route({ view: <GraphEditor /> });
