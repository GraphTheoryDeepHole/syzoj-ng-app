import { MethodComponent } from "@/pages/graph-editor/input/GraphInputPanel";
import { Edge, EdgeList, Graph } from "@/pages/graph-editor/GraphStructure";
import MatrixInputComponent from "@/pages/graph-editor/input/methods/MatrixInputComponent";
import React from "react";

let NetworkGraphComponent: MethodComponent = props => {
  let { graph, setGraph, setRenderType } = props;
  let options: [string, boolean][] = [["have_cost", false]];
  const toString = (g: Graph) => {
    let haveCost = g.edges()[0]?.datum.cost != null;
    return g
      .edges()
      .map(edge =>
        haveCost
          ? `${edge.source} ${edge.target} ${edge.datum.flow || "?"} ${edge.datum.cost || "?"}`
          : `${edge.source} ${edge.target} ${edge.datum.flow || "?"}`
      )
      .join("\n");
  };
  let content, error;
  try {
    content = toString(graph);
  } catch (e) {
    error = e.message;
  }
  const onSync = (numbers: number[][], options) => {
    let haveCost = options[0],
      node_count = 0;
    let edges: Edge[] = numbers.map(line => {
      if (line.length !== (haveCost ? 4 : 3)) throw new Error(".input.error.non_matrix");
      let source = line[0],
        target = line[1],
        flow = line[2],
        cost = haveCost ? line[3] : undefined;
      if (source == null || target == null || flow == null || (haveCost && cost == null))
        throw new Error(".input.error.non_matrix");
      node_count = Math.max(node_count, source, target);
      return { source, target, datum: { flow, cost } };
    });
    setGraph(new EdgeList(node_count + 1, edges));
    setRenderType({
      directed: true,
      bipartite: false,
      dmp: false
    });
  };

  return <MatrixInputComponent initContent={content} initError={error} options={options} onSync={onSync} />;
};

export default NetworkGraphComponent;
