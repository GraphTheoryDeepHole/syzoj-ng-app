import { GraphAlgorithm, Step, ParameterDescriptor } from "../../GraphAlgorithm";
import { EdgeRenderHint, NodeRenderHint } from "../../ui/CanvasGraphRenderer";
import { AdjacencyMatrix, Graph } from "../../GraphStructure";

class EulerPath extends GraphAlgorithm {
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
    };
  }

  edgeRenderPatcher(): Partial<EdgeRenderHint> {
    return {
      color: edge => (edge.datum.visited == true ? "#db70db" : undefined)
    };
  }

  id() {
    return "EulerPath";
  }

  parameters(): ParameterDescriptor[] {
    return [];
  }

  nodeList = [];
  ptr: number;
  start: number;

  addNode(id: number) {
    for (let i = this.nodeList.length - 1; i > this.ptr; i--) {
      this.nodeList[i + 1] = this.nodeList[i];
    }
    this.nodeList[this.ptr + 1] = id;
  }

  *dfs(graph: AdjacencyMatrix, this_node: number): Generator<Step> {
    for (let i = 0; i < graph.nodes().length; i++) {
      graph.nodes()[i].datum.visited = 0;
    }
    Object.assign(graph.nodes()[this_node].datum, { visited: 1 });
    if (this.start == 0) {
      yield {
        graph: graph,
        codePosition: new Map<string, number>([["pseudo", 0]]),
        extraData: [["回路序列", "list", this.nodeList.concat()]]
      };
      this.start = 1;
    } else {
      yield {
        graph: graph,
        codePosition: new Map<string, number>([["pseudo", 2]]),
        extraData: [["回路序列", "list", this.nodeList.concat()]]
      };
    }
    yield {
      graph: graph,
      codePosition: new Map<string, number>([["pseudo", 1]]),
      extraData: [["回路序列", "list", this.nodeList.concat()]]
    };

    for (let edge of graph.edges()) {
      if (edge.source == this_node && edge.datum.visited == false) {
        edge.datum.visited = true;
        this.addNode(edge.target);
        this.ptr++;
        yield* this.dfs(graph, edge.target);
        this.ptr--;
        for (let i = 0; i < graph.nodes().length; i++) {
          graph.nodes()[i].datum.visited = 0;
        }
        Object.assign(graph.nodes()[this_node].datum, { visited: 1 });
        yield {
          graph: graph,
          codePosition: new Map<string, number>([["pseudo", 3]]),
          extraData: [["回路序列", "list", this.nodeList.concat()]]
        };
        yield {
          graph: graph,
          codePosition: new Map<string, number>([["pseudo", 1]]),
          extraData: [["回路序列", "list", this.nodeList.concat()]]
        };
      }
    }
  }

  *run(graph: Graph): Generator<Step> {
    graph.nodes().forEach(n => ((n.datum.visited = 0), (n.datum.sequence = -1)));
    graph.edges().forEach(e => (e.datum.visited = false));
    this.nodeList = [0];
    this.ptr = 0;
    this.start = 0;
    yield* this.dfs(AdjacencyMatrix.from(graph, true), 0);
    for (let i = 0; i < graph.nodes().length; i++) {
      graph.nodes()[i].datum.visited = 0;
    }
    yield {
      graph: graph,
      codePosition: new Map<string, number>([["pseudo", 4]]),
      extraData: [["回路序列", "list", this.nodeList.concat()]]
    };
  }
}

export { EulerPath };
