import { GraphAlgorithm, Step, ParameterDescriptor } from "../../GraphAlgorithm";
import { EdgeRenderHint, NodeRenderHint } from "../../display/CanvasGraphRenderer";
import { AdjacencyList, AdjacencyMatrix, Graph } from "../../GraphStructure";

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

  edgeVisited = [];

  edgeRenderPatcher(): Partial<EdgeRenderHint> {
    return {
      color: edge => (edge.datum & 1 ? "#ffff00" : "#87ceeb"),
      floatingData: edge => edge.datum
    };
  }

  id() {
    return "CriticalPath";
  }

  parameters(): ParameterDescriptor[] {
    return [];
  }

  *run(graph: Graph): Generator<Step> {
    //let graph = AdjacencyList.from(oriGraph, true);
    /*console.log("0");
    yield {
      graph: graph,
      codePosition: new Map<string, number>([["pseudo", 0]])
    };*/
    graph = AdjacencyMatrix.from(graph, true);
    //let mat = graph.mat;
    let topo = [];
    let counter = 0;
    /*console.log("1");
    yield {
      graph: graph,
      codePosition: new Map<string, number>([["pseudo", 0]])
    };*/

    graph.nodes().forEach(n => {
      n.datum.degree = 0;
      n.datum.dist = 0;
      n.datum.topoSequence = -1;
      n.datum.visited = 0;
    });
    /*console.log("2");
    yield {
      graph: graph,
      codePosition: new Map<string, number>([["pseudo", 0]])
    };*/

    /*graph.edges().forEach(e => {
      console.log(e.datum);
      e.datum <<= 1;
      console.log(e.datum);
    });*/
    //console.log("Edge");
    yield {
      graph: graph,
      codePosition: new Map<string, number>([["pseudo", 0]])
    };

    for (let edge of graph.edges()) {
      graph.nodes()[edge.target].datum.degree++;
    }
    for (let i = 0; i < graph.nodes().length; i++) {
      console.log(i, graph.nodes()[i].datum.degree);
    }
    console.log("4");
    yield {
      graph: graph,
      codePosition: new Map<string, number>([["pseudo", 0]])
    };

    for (let i = 0; i < graph.nodes().length; i++) {
      this.edgeVisited[i] = [];
      for (let j = 0; j < graph.nodes().length; j++) {
        this.edgeVisited[i][j] = false;
      }
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
            if ((graph as AdjacencyMatrix).get(i, j) != 0 && (graph as AdjacencyMatrix).get(i, j) != undefined) {
              graph.nodes()[j].datum.degree--;
              this.edgeVisited[i][j] = true;
              /*graph.edges().forEach(edge => {
                if (edge.source == i && edge.target == j) {
                  edge.datum += 1;
                }
              });*/
            }
          }
          for (let j = 0; j < graph.nodes().length; j++) {
            console.log(j, graph.nodes()[j].datum.degree);
          }

          yield {
            graph: graph,
            codePosition: new Map<string, number>([["pseudo", 1]])
          };
        }
      }
    }
    console.log("5");
    yield {
      graph: graph,
      codePosition: new Map<string, number>([["pseudo", 0]])
    };

    /*graph.edges().forEach(e => {
      if (e.datum & 1) {
        e.datum -= 1;
      }
    });*/
    for (let i = 0; i < graph.nodes().length; i++) {
      for (let j = 0; j < graph.nodes().length; j++) {
        this.edgeVisited[i][j] = false;
      }
    }
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
        if (
          graph.nodes()[topo[i]].datum.dist + (graph as AdjacencyMatrix).get(topo[i], topo[j]) > graph.nodes()[topo[j]].datum.dist
        ) {
          graph.nodes()[topo[j]].datum.dist = graph.nodes()[topo[i]].datum.dist + (graph as AdjacencyMatrix).get(topo[i], topo[j]);
        }
        this.edgeVisited[topo[i]][topo[j]] = true;
        /*graph.edges().forEach(edge => {
          if (edge.source == j && edge.target == topo[i]) {
            edge.datum += 1;
          }
        });*/
      }

      console.log(this.edgeVisited);

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
