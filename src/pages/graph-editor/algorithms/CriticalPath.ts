import { GraphAlgorithm } from "../GraphAlgorithm";
import { AdjacencyMatrix, Graph } from "../GraphStructure";

class CriticalPath extends GraphAlgorithm {
  id() {
    return "CriticalPath";
  }

  requiredParameter(): string[] {
    return [];
  }

  *run(graph: Graph) {
    let mat = AdjacencyMatrix.from(graph, true).mat;
    let topo = [];
    let counter = 0;

    graph.nodes().forEach(n => {
      n.datum.degree = 0;
      n.datum.dist = 0;
      n.datum.topoSequence = -1;
    });

    graph.edges().forEach(e => (e.datum = { dist: e.datum, visited: false }));

    for (let edge of graph.edges()) {
      graph.nodes()[edge.target].datum.degree++;
    }

    for (let t = 0; t < graph.nodes().length; t++) {
      for (let i = 0; i < graph.nodes().length; i++) {
        if (graph.nodes()[i].datum.topoSequence == -1 && graph.nodes()[i].datum.degree == 0) {
          graph.nodes()[i].datum.topoSequence = counter;
          topo[counter++] = i;

          yield { graph };

          for (let j = 0; j < graph.nodes().length; j++) {
            if (mat[i][j] != undefined) {
              graph.nodes()[j].datum.degree--;
              graph.edges().forEach(edge => {
                if (edge.source == i && edge.target == j) {
                  edge.datum.visited = true;
                }
              });
            }
          }

          yield { graph };
        }
      }
    }

    graph.edges().forEach(e => (e.datum.visited = false));
    yield { graph };

    for (let i = 1; i < graph.nodes().length; i++) {
      yield { graph };
      for (let j = 0; j < graph.nodes().length; j++) {
        if (graph.nodes()[topo[i]].datum.dist < graph.nodes()[j].datum.dist + mat[j][topo[i]]) {
          graph.nodes()[topo[i]].datum.dist = graph.nodes()[j].datum.dist + mat[j][topo[i]];
        }
        graph.edges().forEach(edge => {
          if (edge.source == j && edge.target == topo[i]) {
            edge.datum.visited = true;
          }
        });
      }

      yield { graph };
    }
  }
}

export { CriticalPath };
