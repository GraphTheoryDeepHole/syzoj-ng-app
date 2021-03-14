import { MethodComponent } from "@/pages/graph-editor/input/GraphInputPanel";
import { Graph, IncidenceMatrix } from "@/pages/graph-editor/GraphStructure";
import MatrixInputComponent from "@/pages/graph-editor/input/methods/MatrixInputComponent";
import React from "react";

let IncidenceMatrixComponent: MethodComponent = props => {
  let { graph, setGraph, setRenderType } = props;
  let options: [string, boolean][] = [["directed", props.renderType?.directed || true]];
  const toString = (g: Graph) => {
    let graph = IncidenceMatrix.from(g, options[0][1]);
    return graph.incmat.map(line => line.map(v => String(v)).join(" ")).join("\n");
  };
  let content, error;
  try {
    content = toString(graph);
  } catch (e) {
    error = e.message;
  }
  const onSync = (numbers, options) => {
    let graph = new IncidenceMatrix(numbers, options[0]);
    setGraph(graph);
    setRenderType({
      directed: options[0],
      bipartite: false,
      dmp: false
    });
  };

  return <MatrixInputComponent initContent={content} initError={error} options={options} onSync={onSync} />;
};

export default IncidenceMatrixComponent;
