import RandomGraphComponent from "@/pages/graph-editor/input/methods/RandomGraphComponent";
import AdjacencyMatrixComponent from "@/pages/graph-editor/input/methods/AdjacencyMatrixComponent";
import IncidenceMatrixComponent from "@/pages/graph-editor/input/methods/IncidenceMatrixComponent";
import EdgeListComponent from "@/pages/graph-editor/input/methods/EdgeListComponent";

const methods = new Map([
  ["random", RandomGraphComponent],
  ["adjmat", AdjacencyMatrixComponent],
  ["incmat", IncidenceMatrixComponent],
  ["edge_list", EdgeListComponent]
]);

export default methods;
