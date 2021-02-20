import { GraphAlgorithm } from "../GraphAlgorithm";
import { AdjacencyMatrix, Graph } from "../GraphStructure";

class Prim extends GraphAlgorithm {
  id() {
    return "Prim";
  }

  requiredParameter(): string[] {
    return [];
  }

  *run(graph: Graph) {
    //并查集初始化
    for (let i = 0; i < graph.nodes().length; i++) {
      graph.nodes()[i].datum = { visited: false };
    }

    for (let i = 0; i < graph.edges().length; i++) {
      graph.edges()[i].datum = { dist: graph.edges()[i].datum, chosen: 0 };
    }

    //Prim
    graph.nodes()[0].datum.visited = true;
    yield { graph };

    for (let i = 0; i < graph.nodes().length - 1; i++) {
      let tarIdx = 0;
      let minl = Infinity;
      for (let i = 0; i < graph.edges().length; i++) {
        if (
          (graph.nodes()[graph.edges()[i].source].datum.visited ^
            graph.nodes()[graph.edges()[i].target].datum.visited) ==
            1 &&
          graph.edges()[i].datum.dist < minl
        ) {
          tarIdx = i;
          minl = graph.edges()[i].datum.dist;
        }
      }

      yield { graph };

      graph.nodes()[graph.edges()[tarIdx].source].datum.visited = true;
      graph.nodes()[graph.edges()[tarIdx].target].datum.visited = true;
      graph.edges()[tarIdx].datum.chosen = 1;

      yield { graph };
    }
  }
}

export { Prim };
