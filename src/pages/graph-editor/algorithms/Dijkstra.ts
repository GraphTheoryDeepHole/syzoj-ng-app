import { GraphAlgorithm, ParameterDescriptor } from "../GraphAlgorithm";
import { AdjacencyMatrix, Graph } from "../GraphStructure";

class Dijkstra extends GraphAlgorithm {
  id() {
    return "dijkstra";
  }

  parameters(): ParameterDescriptor[] {
    return [
      {
        name: "start_point",
        parser: (text, graph) => {
          let x = parseInt(text);
          if (isNaN(x)) throw new Error(".input.error.nan");
          if (x <= 0 || x > graph.nodes().length) throw new Error(".input.error.out_of_range");
          return x;
        }
      }
    ];
  }

  *run(graph: Graph, startPoint: number) {
    let mat = AdjacencyMatrix.from(graph, true).mat;
    graph.nodes().forEach(n => {
      n.datum.visited = false;
      n.datum.dist = Infinity;
    });
    graph.nodes()[startPoint].datum.dist = 0;

    yield { graph };

    for (let i = 0; i < graph.nodes().length; i++) {
      let minDist = Infinity;
      let point = 0;
      for (let j = 0; j < graph.nodes().length; j++) {
        if (graph.nodes()[j].datum.visited == false && graph.nodes()[j].datum.dist < minDist) {
          point = j;
          minDist = graph.nodes()[j].datum.dist;
        }
      }

      graph.nodes()[point].datum.visited = true;
      for (let j = 0; j < graph.nodes().length; j++) {
        if (graph.nodes()[point].datum.dist + mat[point][j] < graph.nodes()[j].datum.dist) {
          graph.nodes()[j].datum.dist = graph.nodes()[point].datum.dist + mat[point][j];
        }
      }

      yield { graph };
    }
  }
}

export { Dijkstra };
