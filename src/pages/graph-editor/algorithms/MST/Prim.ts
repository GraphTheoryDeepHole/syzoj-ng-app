import { GraphAlgorithm, Step, ParameterDescriptor } from "../../GraphAlgorithm";
import { EdgeRenderHint, NodeRenderHint } from "../../display/CanvasGraphRenderer";
import { Graph } from "../../GraphStructure";

class Prim extends GraphAlgorithm {
  nodeRenderPatcher(): Partial<NodeRenderHint> {
    return {};
  }

  edgeRenderPatcher(): Partial<EdgeRenderHint> {
    return {
      color: edge => (edge.datum.chosen ? "#00ff00" : "#0000ff"),
      floatingData: edge => edge.datum.dist
    };
  }

  id() {
    return "Prim";
  }

  parameters(): ParameterDescriptor[] {
    return [];
  }

  *run(graph: Graph): Generator<Step> {
    //并查集初始化
    for (let i = 0; i < graph.nodes().length; i++) {
      graph.nodes()[i].datum = { visited: false };
    }

    for (let i = 0; i < graph.edges().length; i++) {
      graph.edges()[i].datum = { dist: graph.edges()[i].datum, chosen: 0 };
    }

    //Prim
    graph.nodes()[0].datum.visited = true;
    yield {
      graph: graph,
      codePosition: new Map<string, number>([["pseudo", 0]])
    };

    for (let i = 0; i < graph.nodes().length - 1; i++) {
      let tarIdx = 0;
      let minl = Infinity;
      for (let i = 0; i < graph.edges().length; i++) {
        if (
          (graph.nodes()[graph.edges()[i].source].datum.visited ^
            graph.nodes()[graph.edges()[i].target].datum.visited) ==
            1 &&
          graph.edges()[i].datum.dist < minl
        ) {
          tarIdx = i;
          minl = graph.edges()[i].datum.dist;
        }
      }

      yield {
        graph: graph,
        codePosition: new Map<string, number>([["pseudo", 2]])
      };

      graph.nodes()[graph.edges()[tarIdx].source].datum.visited = true;
      graph.nodes()[graph.edges()[tarIdx].target].datum.visited = true;
      graph.edges()[tarIdx].datum.chosen = 1;

      yield {
        graph: graph,
        codePosition: new Map<string, number>([["pseudo", 3]])
      };
    }
  }
}

export { Prim };
