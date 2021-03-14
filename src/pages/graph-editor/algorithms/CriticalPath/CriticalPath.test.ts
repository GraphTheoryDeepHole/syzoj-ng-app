import { CriticalPath } from "./CriticalPath";
import { AdjacencyMatrix } from "../../GraphStructure";

test("CriticalPath", () => {
  let mat = [
    [
      undefined,
      { weight: 15 },
      { weight: 15 },
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined
    ],
    [
      undefined,
      undefined,
      undefined,
      { weight: 5 },
      { weight: 5 },
      undefined,
      undefined,
      undefined,
      undefined,
      { weight: 5 },
      undefined
    ],
    [
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      { weight: 4 }
    ],
    [
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      { weight: 3 },
      undefined,
      undefined,
      { weight: 3 },
      undefined,
      undefined
    ],
    [
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      { weight: 4 },
      undefined,
      undefined,
      { weight: 4 },
      undefined,
      undefined
    ],
    [
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      { weight: 2 },
      { weight: 2 },
      undefined,
      undefined,
      undefined
    ],
    [
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      { weight: 2 }
    ],
    [
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      { weight: 3 }
    ],
    [
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      { weight: 3 },
      { weight: 3 },
      undefined,
      undefined,
      undefined
    ],
    [
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      { weight: 4 },
      { weight: 4 },
      undefined,
      undefined,
      undefined
    ],
    [
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined
    ]
  ];
  let graph = new AdjacencyMatrix(mat, true);
  let topoSeq: number[][] = [];
  let dist: number[][] = [];
  for (let step of new CriticalPath().run(graph)) {
    topoSeq.push(step.graph.nodes().map(n => n.datum.topoSequence));
    dist.push(step.graph.nodes().map(n => n.datum.dist));
  }
  console.table(topoSeq);
  console.table(dist);
});
