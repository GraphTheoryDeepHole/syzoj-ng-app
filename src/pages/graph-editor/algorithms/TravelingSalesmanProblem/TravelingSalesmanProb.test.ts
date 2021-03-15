import { SalesmanPath } from "./TravelingSalesmanProb";
import { AdjacencyMatrix } from "../../GraphStructure";

test("SalesmanPath", () => {
  let mat = [
    [0, 10, 10, 9, 4],
    [10, 0, 13, 4, 20],
    [10, 13, 0, 11, 3],
    [9, 4, 11, 0, 16],
    [4, 20, 3, 16, 0]
  ].map(line => line.map(e => (e > 0 ? { weight: e } : undefined)));
  let graph = new AdjacencyMatrix(mat, false);
  let output = [];
  for (let step of new SalesmanPath().run(graph)) {
    let tmp = [];
    step.graph.edges().forEach(e => {
      if (e.datum.chosen == 1) {
        tmp.push([e.source + 1, e.target + 1]);
      }
    });
    tmp.push(step.extraData[0][2], step.extraData[1][2]);
    output.push(tmp);
  }
  console.table(output);
});
