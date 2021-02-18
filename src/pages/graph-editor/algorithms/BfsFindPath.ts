import { GraphAlgorithm } from "../GraphAlgorithm";
import { AdjacencyMatrix, Graph } from "../GraphStructure";

class BfsFindPath extends GraphAlgorithm {
  constructor() {
    super("BFS", "Breadth First Search");
  }

  *run(graph: Graph, start_point: number) {
    graph = AdjacencyMatrix.from(graph, true);
    graph.nodes().forEach(n => (n.datum.visited = 0));

    let que = [start_point],
      fr = 0,
      bk = 1;
    Object.assign(graph.nodes()[start_point].datum, { visited: 1, dist: 0 });
    yield { graph };
    while (fr != bk) {
      let cur_node = que[fr++],
        cur_data = graph.nodes()[cur_node].datum;
      graph.nodes()[cur_node].datum.visited = 2;
      yield { graph };
      for (let i = 0; i < graph.nodes().length; i++) {
        let i_data = graph.nodes()[i].datum;
        if (i_data.visited == false && (graph as AdjacencyMatrix).get(cur_node, i)) {
          Object.assign(i_data, { visited: 1, dist: cur_data.dist + 1 });
          que[bk++] = i;
        }
      }
      yield { graph };
    }
  }
}

export { BfsFindPath };
