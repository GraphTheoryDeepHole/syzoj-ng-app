import { GraphAlgorithm, Step, ParameterDescriptor } from "../../GraphAlgorithm";
import { EdgeRenderHint, NodeRenderHint } from "../../display/CanvasGraphRenderer";
import { AdjacencyMatrix, Graph } from "../../GraphStructure";

class HamiltonPath extends GraphAlgorithm {
  nodeRenderPatcher(): Partial<NodeRenderHint> {
    return {
      fillingColor: node => {
        if (node.datum.visited == 1) {
          return "#87ceeb";
        } else if (node.datum.visited == 2) {
          return "#ffff00";
        } else if (node.datum.visited == 3) {
          return "#adff2f";
        } else {
          return undefined;
        }
      }
      /*floatingData: node =>
        node.datum.sequence == -1 || node.datum.sequence == undefined
          ? `(${node.id},?)`
          : `(${node.id},${node.datum.sequence})`*/
    };
  }

  edgeRenderPatcher(): Partial<EdgeRenderHint> {
    return {};
  }

  id() {
    return "HamiltonPath";
  }

  parameters(): ParameterDescriptor[] {
    return [
      /*{
        name: "start_point",
        parser: (text, graph) => {
          let x = parseInt(text);
          if (isNaN(x)) throw new Error(".input.error.nan");
          if (x < 0 || x > graph.nodes().length) throw new Error(".input.error.out_of_range");
          return x;
        }
      }*/
    ];
  }

  *dfs(graph: AdjacencyMatrix, this_node: number, nodeNum: number, successFlag: number): Generator<Step> {
    for (let i = 0; i < graph.nodes().length; i++) {
      if (graph.nodes()[i].datum.visited == 2 || graph.nodes()[i].datum.visited == 3) {
        graph.nodes()[i].datum.visited = 1;
      }
    }
    Object.assign(graph.nodes()[this_node].datum, { visited: 2 });
    nodeNum++;
    if (nodeNum == graph.nodes().length && graph.get(this_node, 0)) {
      successFlag = 1;
      for (let edge of graph.edges()) {
        if (edge.source == this_node && edge.target == 0) {
          edge.datum.chosen = true;
        }
      }
      return;
    }
    if (this_node == 0) {
      yield {
        graph: graph,
        codePosition: new Map<string, number>([["pseudo", 0]])
      };
    } else {
      yield {
        graph: graph,
        codePosition: new Map<string, number>([["pseudo", 2]])
      };
    }
    yield {
      graph: graph,
      codePosition: new Map<string, number>([["pseudo", 1]])
    };
    for (let i = 0; i < graph.mat.length; i++) {
      if ((!graph.nodes()[i].datum.visited || i == 0) && graph.get(this_node, i)) {
        for (let edge of graph.edges()) {
          if (edge.source == this_node && edge.target == i) {
            edge.datum.chosen = true;
          }
        }
        yield* this.dfs(graph, i, nodeNum, successFlag);
        if (successFlag == 1) {
          return;
        } else {
          for (let edge of graph.edges()) {
            if (edge.source == this_node && edge.target == i) {
              edge.datum.chosen = true;
            }
          }
        }
        for (let i = 0; i < graph.nodes().length; i++) {
          if (graph.nodes()[i].datum.visited == 2 || graph.nodes()[i].datum.visited == 3) {
            graph.nodes()[i].datum.visited = 1;
          }
        }
        graph.nodes()[this_node].datum.visited = 3;
        yield {
          graph: graph,
          codePosition: new Map<string, number>([["pseudo", 3]])
        };
        yield {
          graph: graph,
          codePosition: new Map<string, number>([["pseudo", 1]])
        };
      }
    }
    Object.assign(graph.nodes()[this_node].datum, { visited: 0 });
    nodeNum--;
  }

  *run(graph: Graph, start_point: number): Generator<Step> {
    //this.dfn = 0;
    graph.nodes().forEach(n => ((n.datum.visited = 0), (n.datum.sequence = -1)));
    yield* this.dfs(AdjacencyMatrix.from(graph, true), start_point, 0, 0);
    for (let i = 0; i < graph.nodes().length; i++) {
      if (graph.nodes()[i].datum.visited == 2 || graph.nodes()[i].datum.visited == 3) {
        graph.nodes()[i].datum.visited = 1;
      }
    }
    yield {
      graph: graph,
      codePosition: new Map<string, number>([["pseudo", 4]])
    };
  }
}

export { HamiltonPath };
