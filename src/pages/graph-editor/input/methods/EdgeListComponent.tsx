import { MethodComponent } from "@/pages/graph-editor/input/GraphInputPanel";
import { Edge, EdgeList, Graph } from "@/pages/graph-editor/GraphStructure";
import MatrixInputComponent from "@/pages/graph-editor/input/methods/MatrixInputComponent";
import React from "react";

let EdgeListComponent: MethodComponent = props => {
  let { graph, setGraph, setRenderType } = props;
  let options: [string, boolean][] = [["directed", props.renderType?.directed || true]];
  const toString = (g: Graph) => {
    let weighted = g.edges()[0]?.datum.weight != null;
    return g
      .edges()
      .map<number[]>(edge => (weighted ? [edge.source, edge.target, edge.datum.weight] : [edge.source, edge.target]))
      .reduce<number[][]>(
        (prev, edge, idx) => {
          edge.forEach((v, i) => (prev[i][idx] = v));
          return prev;
        },
        weighted ? [[], [], []] : [[], []]
      )
      .map<string>(line =>
        line
          .map<string>(v => String(v))
          .join(" ")
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
    if (numbers.length != 2 && numbers.length != 3) {
      throw new Error(".input.error.invalid_row_count");
    }
    let edges: Edge[] = [],
      weighted = numbers.length == 3,
      node_count = 0;
    for (let i = 0; i < numbers[0].length; i++) {
      let s = numbers[0][i],
        t = numbers[1][i],
        w = weighted ? numbers[2][i] : undefined;
      if (s == null || t == null || (weighted && w == null)) {
        throw new Error(".input.error.non_matrix");
      }
      node_count = Math.max(node_count, s, t);
      edges.push({ source: s, target: t, datum: { weight: w } });
    }
    setGraph(new EdgeList(node_count + 1, edges));
    setRenderType({
      directed: options[0],
      bipartite: false,
      dmp: false
    });
  };

  return <MatrixInputComponent initContent={content} initError={error} options={options} onSync={onSync} />;
};

export default EdgeListComponent;
