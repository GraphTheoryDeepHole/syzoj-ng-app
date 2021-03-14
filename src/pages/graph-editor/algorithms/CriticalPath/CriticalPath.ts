import { GraphAlgorithm, Step, ParameterDescriptor } from "../../GraphAlgorithm";
import { EdgeRenderHint, NodeRenderHint } from "../../display/CanvasGraphRenderer";
import { AdjacencyMatrix, Graph } from "../../GraphStructure";

class CriticalPath extends GraphAlgorithm {
  nodeRenderPatcher(): Partial<NodeRenderHint> {
    return {
      fillingColor: node => {
        if (node.datum.visited == 1) {
          return "#87ceeb";
        } else if (node.datum.visited == 2) {
          return "#ffff00";
        }
        if (node.datum.visited == 3) {
          return "#adff2f";
        } else {
          return undefined;
        }
      },
      floatingData: node => {
        if (node.datum.topoSequence == -1 || node.datum.topoSequence == undefined) {
          return `(${node.id},?,?)`;
        } else {
          return `(${node.id},${node.datum.topoSequence},${node.datum.dist})`;
        }
      }
    };
  }

  edgeRenderPatcher(): Partial<EdgeRenderHint> {
    return {
      color: edge => (edge.datum.visited == true ? "#db70db" : undefined),
      floatingData: edge => edge.datum.weight
    };
  }

  id() {
    return "CriticalPath";
  }

  parameters(): ParameterDescriptor[] {
    return [];
  }

  *run(graph: Graph): Generator<Step> {
    graph = AdjacencyMatrix.from(graph, true);
    let mat = (graph as AdjacencyMatrix).mat;
    let topo = [];
    let counter = 0;

    graph.nodes().forEach(n => {
      n.datum.degree = 0;
      n.datum.dist = 0;
      n.datum.topoSequence = -1;
      n.datum.visited = 0;
    });

    graph.edges().forEach(e => {
      e.datum.visited = false;
    });

    for (let edge of graph.edges()) {
      graph.nodes()[edge.target].datum.degree++;
    }

    for (let t = 0; t < graph.nodes().length; t++) {
      for (let i = 0; i < graph.nodes().length; i++) {
        if (graph.nodes()[i].datum.visited == 0 && graph.nodes()[i].datum.degree == 0) {
          graph.nodes()[i].datum.topoSequence = counter;
          graph.nodes()[i].datum.visited = 1;
          topo[counter++] = i;

          yield {
            graph: graph,
            codePosition: new Map<string, number>([["pseudo", 0]])
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
            codePosition: new Map<string, number>([["pseudo", 1]])
          };
        }
      }
    }

    graph.edges().forEach(e => {
      e.datum.visited = false;
    });
    yield {
      graph: graph,
      codePosition: new Map<string, number>([["pseudo", 2]])
    };

    for (let i = 0; i < graph.nodes().length; i++) {
      yield {
        graph: graph,
        codePosition: new Map<string, number>([["pseudo", 3]])
      };

      graph.nodes()[topo[i]].datum.visited = 2;
      for (let j = i + 1; j < graph.nodes().length; j++) {
        if (mat[topo[i]][topo[j]] != undefined) {
          if (graph.nodes()[topo[i]].datum.dist + mat[topo[i]][topo[j]].weight > graph.nodes()[topo[j]].datum.dist) {
            graph.nodes()[topo[j]].datum.dist = graph.nodes()[topo[i]].datum.dist + mat[topo[i]][topo[j]].weight;
          }
        }
        graph.edges().forEach(edge => {
          if (edge.source == topo[i] && edge.target == topo[j]) {
            edge.datum.visited = true;
          }
        });
      }

      yield {
        graph: graph,
        codePosition: new Map<string, number>([["pseudo", 4]])
      };
    }

    yield {
      graph: graph,
      codePosition: new Map<string, number>([["pseudo", 5]])
    };
  }
}

export { CriticalPath };
