import { GraphAlgorithm, Step, ParameterDescriptor } from "../../GraphAlgorithm";
import { EdgeRenderHint, NodeRenderHint } from "../../display/CanvasGraphRenderer";
import { AdjacencyMatrix, Edge, Graph } from "../../GraphStructure";

class SalesmanPath extends GraphAlgorithm {
  nodeRenderPatcher(): Partial<NodeRenderHint> {
    return {
      fillingColor: undefined,
      floatingData: node => (node.id == 0 ? node.datum.answer : undefined)
    };
  }

  edgeRenderPatcher(): Partial<EdgeRenderHint> {
    return {
      color: edge => (edge.datum.chosen ? "#db70db" : undefined),
      floatingData: edge => edge.datum.weight
    };
  }

  id() {
    return "SalesmanProblem";
  }

  parameters(): ParameterDescriptor[] {
    return [];
  }

  judge(graph: Graph, edges: Edge[]) {
    //判断是否有点度大于2（排除分支情况）
    let cnt = [];
    for (let i in graph.nodes()) {
      cnt[i] = 0;
    }
    for (let edge of edges) {
      if (edge.datum.chosen == true) {
        cnt[edge.source]++;
        cnt[edge.target]++;
        if (cnt[edge.source] > 2 || cnt[edge.target] > 2) {
          return 0;
        }
      }
    }

    //判断是否连通（排除多回路情况）
    let scc = [];
    for (let i in graph.nodes()) {
      scc[i] = Number(i);
    }
    for (let i = 0; i < graph.nodes().length; i++) {
      for (let edge of edges) {
        if (edge.datum.chosen == 1) {
          if (scc[edge.source] < scc[edge.target]) {
            scc[edge.target] = scc[edge.source];
          } else {
            scc[edge.source] = scc[edge.target];
          }
        }
      }
    }
    for (let i in graph.nodes()) {
      if (scc[i] != 0) {
        return 0;
      }
    }
    return 2;
  }

  *salesmanProb(graph: Graph, edges: Edge[]): Generator<Step> {
    let node = 0;
    let chosenCnt = 0;
    let now = 0;

    //所有边初始时均为未选中状态
    for (let i = 0; i < edges.length; i++) {
      edges[i].datum.chosen = 0;
    }
    graph.nodes()[0].datum.answer = Infinity;

    while (node >= 0) {
      //选择足够的边
      while (chosenCnt < graph.nodes().length) {
        edges[node].datum.chosen = 1;
        now += edges[node].datum.weight;
        node++;
        chosenCnt++;
      }

      yield {
        graph: graph,
        codePosition: new Map<string, number>([["pseudo", 0]])
      };

      //判断选择是否合法
      let judRes = now >= graph.nodes()[0].datum.answer ? 1 : this.judge(graph, edges);
      //更新答案
      if (judRes == 2) {
        if (now < graph.nodes()[0].datum.answer) {
          graph.nodes()[0].datum.answer = now;
        }
      }
      yield {
        graph: graph,
        codePosition: new Map<string, number>([["pseudo", 1]])
      };

      //退栈
      if (judRes > 0 || node >= edges.length) {
        while (--node >= 0) {
          if (edges[node].datum.chosen == 0) {
            break;
          } else {
            edges[node].datum.chosen = 0;
            now -= edges[node].datum.weight;
            chosenCnt--;
          }
        }
      }

      //继续深探
      while (--node >= 0) {
        if (edges[node].datum.chosen == 1) {
          edges[node].datum.chosen = 0;
          now -= edges[node].datum.weight;
          node++;
          chosenCnt--;
          break;
        }
      }

      yield {
        graph: graph,
        codePosition: new Map<string, number>([["pseudo", 2]])
      };
    }
  }

  *run(graph: Graph): Generator<Step> {
    let edges = AdjacencyMatrix.from(graph, false).edges().concat();
    //排序（冒泡排序）
    for (let i = 0; i < edges.length; i++) {
      for (let j = 0; j < edges.length - 1; j++) {
        if (edges[j].datum.weight > edges[j + 1].datum.weight) {
          let tmp = edges[j];
          edges[j] = edges[j + 1];
          edges[j + 1] = tmp;
        }
      }
    }
    yield* this.salesmanProb(graph, edges);
    yield {
      graph: graph,
      codePosition: new Map<string, number>([["pseudo", 3]])
    };
  }
}

export { SalesmanPath };
