import { GraphAlgorithm, Step, ParameterDescriptor } from "../GraphAlgorithm";
import { EdgeRenderHint, NodeRenderHint } from "../display/CanvasGraphRenderer";
import { AdjacencyMatrix, Graph } from "../GraphStructure";

class CriticalPath extends GraphAlgorithm {
  nodeRenderPatcher(): Partial<NodeRenderHint> {
    return {
      fillingColor: node => (node.datum.visited ? "#ff0000" : undefined),
      floatingData: node => (node.datum.visited ? "Topo: " + node.datum.topoSequence + "Dist: " + node.datum.dist : "")
    };
  }

  edgeRenderPatcher(): Partial<EdgeRenderHint> {
    return {
      color: edge => (edge.datum.visited ? "#00ff00" : undefined),
      floatingData: edge => edge.datum.dist
    };
  }

  id() {
    return "CriticalPath";
  }

  parameters(): ParameterDescriptor[] {
    return [];
  }

  *run(graph: Graph): Generator<Step> {
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

          yield {
            graph: graph,
            codePosition: new Map<string, number>([["pseudo", 1]])
          };

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

          yield {
            graph: graph,
            codePosition: new Map<string, number>([["pseudo", 2]])
          };
        }
      }
    }

    graph.edges().forEach(e => (e.datum.visited = false));
    yield {
      graph: graph,
      codePosition: new Map<string, number>([["pseudo", 3]])
    };

    for (let i = 1; i < graph.nodes().length; i++) {
      yield {
        graph: graph,
        codePosition: new Map<string, number>([["pseudo", 4]])
      };
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

      yield {
        graph: graph,
        codePosition: new Map<string, number>([["pseudo", 5]])
      };
    }
  }
}

export { CriticalPath };
