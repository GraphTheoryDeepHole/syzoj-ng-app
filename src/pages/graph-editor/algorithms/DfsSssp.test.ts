import { DfsSssp } from "./DfsSssp";
import { AdjacencyMatrix } from "../GraphStructure";

test("dfs", () => {
  let mat = [
    [0, 1, 1, 1, 0],
    [6, 0, 2, 2, 0],
    [0, 3, 0, 9, 0],
    [3, 0, 7, 0, 8],
    [0, 5, 0, 0, 0]
  ];
  let graph = new AdjacencyMatrix(mat, true);
  let dfs = new DfsSssp();
  let steps = Array.from(dfs.run(graph, 0))
    .map(s => s.graph.nodes())
    .map(nl => nl.map(n => n.datum.dist));
  let inf = Infinity;
  let expected = [
    [0, inf, inf, inf, inf],
    [0, 1, inf, inf, inf],
    [0, 1, 3, inf, inf],
    [0, 1, 3, 12, inf],
    [0, 1, 3, 12, 20],
    [0, 1, 3, 3, 20],
    [0, 1, 3, 3, 11],
    [0, 1, 1, 3, 11],
    [0, 1, 1, 1, 11],
    [0, 1, 1, 1, 9]
  ];
  expect(steps).toStrictEqual(expected);
});
