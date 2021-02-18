import { GraphAlgorithm, Step } from "../GraphAlgorithm";
import { AdjacencyMatrix, Graph } from "../GraphStructure";

class DfsFindPath extends GraphAlgorithm {
  constructor() {
    super("DFS", "Depth First Search");
  }

  *dfs(dfn: number, graph: AdjacencyMatrix, this_node: number): Generator<Step> {
    for (let i = 0; i < graph.nodes().length; i++) {
      if (graph.nodes()[i].datum.visited == 2) {
        graph.nodes()[i].datum.visited = 1;
      }
    }
    Object.assign(graph.nodes()[this_node].datum, { visited: 2, sequence: dfn });
    yield { graph };
    for (let i = 0; i < graph.mat.length; i++) {
      if (!graph.nodes()[i].datum.visited && graph.get(this_node, i)) {
        yield* this.dfs(dfn + 1, graph, i);
        for (let i = 0; i < graph.nodes().length; i++) {
          if (graph.nodes()[i].datum.visited == 2) {
            graph.nodes()[i].datum.visited = 1;
          }
        }
        graph.nodes()[this_node].datum.visited = 2;
        yield { graph };
      }
    }
  }

  run(graph: Graph, start_point: number) {
    graph.nodes().forEach(n => (n.datum.visited = 0));
    return this.dfs(0, AdjacencyMatrix.from(graph, true), start_point);
  }
}

export { DfsFindPath };
