import { GraphAlgorithm, Step, ParameterDescriptor } from "../../GraphAlgorithm";
import { EdgeRenderHint, NodeRenderHint } from "../../display/CanvasGraphRenderer";
import { AdjacencyMatrix, Graph } from "../../GraphStructure";

class BfsFindPath extends GraphAlgorithm {
  nodeRenderPatcher(): Partial<NodeRenderHint> {
    return {
      fillingColor: node => {
        if (node.datum.visited == 1) {
          return "#00df6f";
        } else if (node.datum.visited == 2) {
          return "#00ffff";
        } else if (node.datum.visited == 3) {
          return "#00ff00";
        } else {
          return undefined;
        }
      },
      floatingData: node => `(id: ${node.id}, dist: ${node.datum.dist})`
    };
  }

  edgeRenderPatcher(): Partial<EdgeRenderHint> {
    return {};
  }

  id() {
    return "BFS";
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

  *run(graph: Graph, start_point: number): Generator<Step> {
    graph = AdjacencyMatrix.from(graph, true);
    graph.nodes().forEach(n => (n.datum.visited = 0, n.datum.dist = Infinity));

    let que = [start_point],
      fr = 0,
      bk = 1;
    Object.assign(graph.nodes()[start_point].datum, { visited: 1, dist: 0 });
    yield {
      graph: graph,
      codePosition: new Map<string, number>([["pseudo", 0]])
    };
    while (fr != bk) {
      let cur_node = que[fr++],
        cur_data = graph.nodes()[cur_node].datum;
      graph.nodes()[cur_node].datum.visited = 2;
      yield {
        graph: graph,
        codePosition: new Map<string, number>([["pseudo", 2]])
      };
      for (let i = 0; i < graph.nodes().length; i++) {
        let i_data = graph.nodes()[i].datum;
        if (i_data.visited == false && (graph as AdjacencyMatrix).get(cur_node, i)) {
          Object.assign(i_data, { visited: 1, dist: cur_data.dist + 1 });
          que[bk++] = i;
        }
      }
      yield {
        graph: graph,
        codePosition: new Map<string, number>([["pseudo", 3]])
      };
      graph.nodes()[cur_node].datum.visited = 3;
    }
  }
}

export { BfsFindPath };
