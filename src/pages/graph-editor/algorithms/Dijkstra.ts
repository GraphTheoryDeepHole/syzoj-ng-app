import { GraphAlgorithm, Step, ParameterDescriptor } from "../GraphAlgorithm";
import { EdgeRenderHint, NodeRenderHint } from "../display/CanvasGraphRenderer";
import { AdjacencyMatrix, Graph } from "../GraphStructure";

class Dijkstra extends GraphAlgorithm {
  nodeRenderPatcher(): Partial<NodeRenderHint> {
    return {
      fillingColor: node => (node.datum.visited ? "#ff0000" : undefined),
      floatingData: node => (node.datum.visited ? node.datum.dist : "")
    };
  }

  edgeRenderPatcher(): Partial<EdgeRenderHint> {
    return {
      color: edge =>(edge.datum.visited ? "#00ff00" : undefined),
      floatingData: edge => (edge.datum.dist)
    };
  }

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

  *run(graph: Graph, startPoint: number): Generator<Step> {
    let mat = AdjacencyMatrix.from(graph, true).mat;
    graph.nodes().forEach(n => {
      n.datum.visited = false;
      n.datum.dist = Infinity;
    });
    graph.edges().forEach(e => {
      e.datum.dist = e.datum;
      e.datum.visited = false;
    })
    graph.nodes()[startPoint].datum.dist = 0;

    yield {
      graph: graph,
      codePosition: new Map<string, number>([["pseudo", 0]])
    };

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
      yield {
        graph: graph,
        codePosition: new Map<string, number>([["pseudo", 1]])
      };

      for (let j = 0; j < graph.nodes().length; j++) {
        if (graph.nodes()[point].datum.dist + mat[point][j] < graph.nodes()[j].datum.dist) {
          graph.nodes()[j].datum.dist = graph.nodes()[point].datum.dist + mat[point][j];
        }
        for (let k = 0; k < graph.edges().length; k++) {
          if (graph.edges()[k].source == point && graph.edges()[k].target == j) {
            graph.edges()[k].datum.visited = true;
          }
        }
      }

      yield {
        graph: graph,
        codePosition: new Map<string, number>([["pseudo", 2]])
      };
    }
  }
}

export { Dijkstra };
