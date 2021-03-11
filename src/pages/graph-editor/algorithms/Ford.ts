import { GraphAlgorithm, Step, ParameterDescriptor } from "../GraphAlgorithm";
import { EdgeRenderHint, NodeRenderHint } from "../display/CanvasGraphRenderer";
import { AdjacencyMatrix, Graph } from "../GraphStructure";

class Ford extends GraphAlgorithm {
  nodeRenderPatcher(): Partial<NodeRenderHint> {
    return {
      fillingColor: node => (node.datum.visited == true ? "#ff0000" : undefined),
      floatingData: node => (node.datum.dist != Infinity ? node.datum.dist : "")
    };
  }

  edgeRenderPatcher(): Partial<EdgeRenderHint> {
    return {};
  }

  id() {
    return "Ford";
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
    graph.nodes().forEach(n => (n.datum.dist = Infinity, n.datum.visited = false));
    graph.nodes()[startPoint].datum.dist = 0;

    yield {
      graph: graph,
      codePosition: new Map<string, number>([["pseudo", 0]])
    };

    for (let flag = 0; ; flag = 0) {
      yield {
        graph: graph,
        codePosition: new Map<string, number>([["pseudo", 1]])
      };
      for (let j = 0; j < graph.nodes().length; j++) {
        for (let k = 0; k < graph.nodes().length; k++) {
          let existFlag = 0;
          for (let l = 0; l < graph.edges().length; l++) {
            if (graph.edges()[l].source == j && graph.edges()[l].target == k) {
              existFlag = 1;
            }
          }
          if (existFlag == 1 && graph.nodes()[j].datum.dist + mat[j][k] < graph.nodes()[k].datum.dist) {
            graph.nodes()[k].datum.dist = graph.nodes()[j].datum.dist + mat[j][k];
            flag = 1;
            graph.nodes()[j].datum.visited = true;
            graph.nodes()[k].datum.visited = true;
            yield {
              graph: graph,
              codePosition: new Map<string, number>([["pseudo", 3]])
            };
            graph.nodes()[j].datum.visited = false;
            graph.nodes()[k].datum.visited = false;
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
