import { MethodComponent } from "@/pages/graph-editor/input/GraphInputPanel";
import { AdjacencyList, Graph } from "@/pages/graph-editor/GraphStructure";
import MatrixInputComponent from "@/pages/graph-editor/input/methods/MatrixInputComponent";
import React from "react";

let ForwardListComponent: MethodComponent = props => {
  let { graph, setGraph, setRenderType } = props;
  let options: [string, boolean][] = [["directed", props.renderType?.directed || true]];
  const toString = (g: Graph) => {
    let weighted = g.edges()[0]?.datum.weight != null;
    let adjlist = AdjacencyList.from(g, options[0][1]).adjlist;
    let A = [],
      B = [],
      Z = [],
      edge_count = 0;
    const toString = (numbers: number[]) => numbers.map(x => String(x)).join(" ");
    for (let s = 0; s < g.nodes().length; s++) {
      adjlist[s].forEach(([t, datum]) => {
        B[edge_count] = t;
        if (weighted) {
          Z[edge_count] = datum.weight;
        }
        ++edge_count;
      });
      A[s] = edge_count;
    }
    return [A, B, Z].map(toString).join("\n");
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
    let adjlist: [number, any][][] = [],
      edge_count = 0,
      weighted = numbers.length == 3;
    for (let s = 0; s < numbers[0].length; s++) {
      adjlist[s] = [];
      if (numbers[0][s] < edge_count) {
        throw new Error(".input.error.non_increment");
      }
      while (edge_count < numbers[0][s]) {
        let t = numbers[1][edge_count],
          w = weighted ? numbers[2][edge_count] : undefined;
        if (t == null || (weighted && w == null)) {
          throw new Error(".input.error.non_matrix");
        }
        adjlist[s].push([t, { weight: w }]);
        ++edge_count;
      }
    }
    setGraph(new AdjacencyList(adjlist));
    setRenderType({
      directed: options[0],
      bipartite: false,
      dmp: false
    });
  };

  return <MatrixInputComponent initContent={content} initError={error} options={options} onSync={onSync} />;
};

export default ForwardListComponent;
