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
        } /*if (node.datum.visited == 3)*/ else {
          return "#adff2f";
        } /*else {
          return undefined;
        }*/
      },
      floatingData: node => {
        if (this.stage == 0) {
          if (node.datum.topoSequence == -1 || node.datum.topoSequence == undefined) {
            return `(${node.id},?)`;
          } else {
            return `(${node.id},${node.datum.topoSequence})`;
          }
        } else {
          return `(${node.id},${node.datum.topoSequence},${node.datum.dist})`;
        }
      }
    };
  }

  edgeRenderPatcher(): Partial<EdgeRenderHint> {
    return {
      /*color: edge => (edge.datum.visited ? "#87ceeb" : "#ffff00"),
      floatingData: edge => edge.datum.weight*/
    };
  }

  id() {
    return "CriticalPath";
  }

  parameters(): ParameterDescriptor[] {
    return [];
  }

  stage = 0;

  *run(graph: Graph): Generator<Step> {
    let mat = AdjacencyMatrix.from(graph, true).mat;
    let topo = [];
    let counter = 0;

    graph.nodes().forEach(n => {
      n.datum.degree = 0;
      n.datum.dist = 0;
      n.datum.topoSequence = -1;
      n.datum.visited = 0;
    });

    graph.edges().forEach(e => (e.datum = { weight: e.datum, visited: false }));

    for (let edge of graph.edges()) {
      graph.nodes()[edge.target].datum.degree++;
    }

    for (let t = 0; t < graph.nodes().length; t++) {
      for (let i = 0; i < graph.nodes().length; i++) {
        if (graph.nodes()[i].datum.topoSequence == -1 && graph.nodes()[i].datum.degree == 0) {
          graph.nodes()[i].datum.topoSequence = counter;
          graph.nodes()[i].datum.visited = 1;
          topo[counter++] = i;

          yield {
            graph: graph,
            codePosition: new Map<string, number>([["pseudo", 0]])
          };

          for (let j = 0; j < graph.nodes().length; j++) {
            if (mat[i][j] != 0) {
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

    this.stage = 1;
    graph.edges().forEach(e => (e.datum.visited = false));
    yield {
      graph: graph,
      codePosition: new Map<string, number>([["pseudo", 2]])
    };

    for (let i = 1; i < graph.nodes().length; i++) {
      yield {
        graph: graph,
        codePosition: new Map<string, number>([["pseudo", 3]])
      };

      graph.nodes()[topo[i]].datum.visited = 2;
      for (let j = 0; j < graph.nodes().length; j++) {
        if (graph.nodes()[topo[i]].datum.weight < graph.nodes()[j].datum.weight + mat[j][topo[i]]) {
          graph.nodes()[topo[i]].datum.weight = graph.nodes()[j].datum.weight + mat[j][topo[i]];
        }
        graph.edges().forEach(edge => {
          if (edge.source == j && edge.target == topo[i]) {
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
