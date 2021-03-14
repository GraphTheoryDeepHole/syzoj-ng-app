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
      color: edge => (edge.datum.visited == true ? "#ffff00" : "#87ceeb"),
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
    //let graph = AdjacencyList.from(oriGraph, true);
    /*console.log("0");
    yield {
      graph: graph,
      codePosition: new Map<string, number>([["pseudo", 0]])
    };*/
    graph = AdjacencyMatrix.from(graph, true);
    let mat = (graph as AdjacencyMatrix).mat;
    let topo = [];
    let counter = 0;

    console.log(mat);

    graph.nodes().forEach(n => {
      n.datum.degree = 0;
      n.datum.dist = 0;
      n.datum.topoSequence = -1;
      n.datum.visited = 0;
    });

    graph.edges().forEach(e => {
      e.datum.visited = false;
    });

    yield {
      graph: graph,
      codePosition: new Map<string, number>([["pseudo", 0]])
    };

    for (let edge of graph.edges()) {
      graph.nodes()[edge.target].datum.degree++;
    }
    /*for (let i = 0; i < graph.nodes().length; i++) {
      console.log(i, graph.nodes()[i].datum.degree);
    }
    console.log("4");*/
    yield {
      graph: graph,
      codePosition: new Map<string, number>([["pseudo", 0]])
    };

    /*for (let i = 0; i < graph.nodes().length; i++) {
      this.edgeVisited[i] = [];
      for (let j = 0; j < graph.nodes().length; j++) {
        this.edgeVisited[i][j] = false;
      }
    }*/

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
              graph.edges();
              //this.edgeVisited[i][j] = true;
              graph.edges().forEach(edge => {
                if (edge.source == i && edge.target == j) {
                  edge.datum.visited = true;
                }
              });
            }
          }
          /*for (let j = 0; j < graph.nodes().length; j++) {
            console.log(j, graph.nodes()[j].datum.degree);
          }*/

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
    /*for (let i = 0; i < graph.nodes().length; i++) {
      for (let j = 0; j < graph.nodes().length; j++) {
        this.edgeVisited[i][j] = false;
      }
    }*/
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
          if (
            graph.nodes()[topo[i]].datum.dist + mat[topo[i]][topo[j]].weight >
            graph.nodes()[topo[j]].datum.dist
          ) {
            graph.nodes()[topo[j]].datum.dist = graph.nodes()[topo[i]].datum.dist + mat[topo[i]][topo[j]].weight;
          }
        }
        //this.edgeVisited[topo[i]][topo[j]] = true;
        graph.edges().forEach(edge => {
          if (edge.source == j && edge.target == topo[i]) {
            edge.datum.visited = true;
          }
        });
      }

      //console.log(this.edgeVisited);

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
