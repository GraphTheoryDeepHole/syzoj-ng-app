import { GraphAlgorithm, Step, ParameterDescriptor } from "../../GraphAlgorithm";
import { EdgeRenderHint, NodeRenderHint } from "../../display/CanvasGraphRenderer";
import { AdjacencyMatrix, Graph } from "../../GraphStructure";

class DfsFindPath extends GraphAlgorithm {
  nodeRenderPatcher(): Partial<NodeRenderHint> {
    return {
      fillingColor: node => {
        if (node.datum.visited == 1) {
          return "#808000";
        } else if (node.datum.visited == 2) {
          return "#ffff00";
        } else if (node.datum.visited == 3) {
          return "#adff2f";
        } else {
          return undefined;
        }
      },
      floatingData: node => `(id:${node.id},dfn:${node.datum.sequence})`
    };
  }

  edgeRenderPatcher(): Partial<EdgeRenderHint> {
    return {};
  }

  id() {
    return "DFS";
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

  *dfs(dfn: number, graph: AdjacencyMatrix, this_node: number): Generator<Step> {
    for (let i = 0; i < graph.nodes().length; i++) {
      if (graph.nodes()[i].datum.visited == 2) {
        graph.nodes()[i].datum.visited = 1;
      }
    }
    Object.assign(graph.nodes()[this_node].datum, { visited: 2, sequence: dfn });
    yield {
      graph: graph,
      codePosition: new Map<string, number>([["pseudo", 1]])
    };
    for (let i = 0; i < graph.mat.length; i++) {
      if (!graph.nodes()[i].datum.visited && graph.get(this_node, i)) {
        yield* this.dfs(dfn + 1, graph, i);
        for (let i = 0; i < graph.nodes().length; i++) {
          if (graph.nodes()[i].datum.visited == 2) {
            graph.nodes()[i].datum.visited = 1;
          }
        }
        graph.nodes()[this_node].datum.visited = 2;
        yield {
          graph: graph,
          codePosition: new Map<string, number>([["pseudo", 2]])
        };
      }
    }
  }

  *run(graph: Graph, start_point: number): Generator<Step> {
    graph.nodes().forEach(n => ((n.datum.visited = 0), (n.datum.sequence = -1)));
    yield* this.dfs(0, AdjacencyMatrix.from(graph, true), start_point);
  }
}

export { DfsFindPath };
