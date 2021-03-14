import { HamiltonPath } from "./HamiltonPath";
import { AdjacencyMatrix } from "../../GraphStructure";

test("HamiltonPath", () => {
  let mat = [
    [0, 1, 1, 0, 0],
    [0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0]
  ].map(line => line.map(e => (e === 1 ? {} : undefined)));
  let graph = new AdjacencyMatrix(mat, true);
  let res = [];
  for (let step of new HamiltonPath().run(graph)) {
    res.push(step.graph.edges().map(e => e.datum.chosen + " " + e.source + " " + e.target));
  }
  console.table(res);
});
