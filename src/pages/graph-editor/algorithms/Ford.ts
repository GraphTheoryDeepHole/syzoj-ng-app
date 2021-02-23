import { GraphAlgorithm } from "../GraphAlgorithm";
import { AdjacencyMatrix, Graph } from "../GraphStructure";

class Ford extends GraphAlgorithm {
  id() {
    return "Ford";
  }

  requiredParameter(): string[] {
    return ["start_point"];
  }

  *run(graph: Graph, startPoint: number) {
    let mat = AdjacencyMatrix.from(graph, true).mat;
    graph.nodes().forEach(n => (n.datum.dist = Infinity));
    graph.nodes()[startPoint].datum.dist = 0;

    for (let flag = 0; ; flag = 0) {
      yield { graph };
      for (let j = 0; j < graph.nodes().length; j++) {
        for (let k = 0; k < graph.nodes().length; k++) {
          if (graph.nodes()[j].datum.dist + mat[j][k] < graph.nodes()[k].datum.dist) {
            graph.nodes()[k].datum.dist = graph.nodes()[j].datum.dist + mat[j][k];
            flag = 1;
            yield { graph };
          }
        }
      }

      if (flag == 0) {
        break;
      }
    }
  }
}

export { Ford };
