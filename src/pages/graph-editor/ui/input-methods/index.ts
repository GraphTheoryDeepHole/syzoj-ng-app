import RandomGraphComponent from "@/pages/graph-editor/ui/input-methods/RandomGraphComponent";
import AdjacencyMatrixComponent from "@/pages/graph-editor/ui/input-methods/AdjacencyMatrixComponent";
import IncidenceMatrixComponent from "@/pages/graph-editor/ui/input-methods/IncidenceMatrixComponent";
import EdgeListComponent from "@/pages/graph-editor/ui/input-methods/EdgeListComponent";
import ForwardListComponent from "@/pages/graph-editor/ui/input-methods/ForwardListComponent";
import NetworkGraphComponent from "@/pages/graph-editor/ui/input-methods/NetworkGraphComponent";

const methods = new Map([
  ["random", RandomGraphComponent],
  ["adjmat", AdjacencyMatrixComponent],
  ["incmat", IncidenceMatrixComponent],
  ["edge_list", EdgeListComponent],
  ["fwd_list", ForwardListComponent],
  ["network", NetworkGraphComponent]
]);

export default methods;
