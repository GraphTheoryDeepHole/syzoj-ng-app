import { EulerPath } from "./EulerPath";
import { AdjacencyMatrix } from "../../GraphStructure";

test("EulerPath", () => {
  let mat = [
    [0, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0]
  ].map(line => line.map(e => (e === 1 ? {} : undefined)));
  let graph = new AdjacencyMatrix(mat, true);
  let res = [];
  for (let step of new EulerPath().run(graph)) {
    res.push(step.extraData[0][2]);
  }
  console.table(res);
});
