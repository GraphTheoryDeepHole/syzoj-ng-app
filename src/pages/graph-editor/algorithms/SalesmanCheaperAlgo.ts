import { GraphAlgorithm, Step, ParameterDescriptor } from "../GraphAlgorithm";
import { EdgeRenderHint, NodeRenderHint } from "../display/CanvasGraphRenderer";
import { AdjacencyMatrix, Graph } from "../GraphStructure";

class SalesmanCheaperAlgo extends GraphAlgorithm {
  nodeRenderPatcher(): Partial<NodeRenderHint> {
    return {
      fillingColor: node => (node.datum.chosen ? "#ff0000" : undefined),
      floatingData: node => (node.id == 0 ? node.datum.answer : "")
    };
  }

  edgeRenderPatcher(): Partial<EdgeRenderHint> {
    return {
      color: edge => (edge.datum.chosen ? "#00ff00" : undefined),
      floatingData: edge => (edge.datum.dist)
    };
  }

  id() {
    return "SalesmanCheaperAlgorithm";
  }

  parameters(): ParameterDescriptor[] {
    return [];
  }

  *salesmanCheaperAlgo(graph: Graph): Generator<Step> {
    let nodes = [];
    let mat = AdjacencyMatrix.from(graph, true).mat;

    for (let i = 0; i < graph.nodes().length; i++) {
      mat[i][i] = 0;
      nodes[i] = i;
      graph.nodes()[i].datum = { chosen: 0 };
    }
    graph.nodes()[0].datum.answer = 0;

    for (let i = 0; i < graph.edges().length; i++) {
      graph.edges()[i].datum = { dist: graph.edges()[i].datum, chosen: 0 };
    }

    yield {
      graph: graph,
      codePosition: new Map<string, number>([["pseudo", 0]])
    };

    //共进行n-1次操作
    for (let i = 0; i < graph.nodes().length - 1; i++) {
      //寻找最近的点对
      let minj = 0;
      let mink = graph.nodes().length - 1;
      for (let j = 0; j <= i; j++) {
        for (let k = i + 1; k < graph.nodes().length; k++) {
          if (mat[nodes[j]][nodes[k]] < mat[nodes[minj]][nodes[mink]]) {
            minj = j;
            mink = k;
          }
        }
      }

      //把该点合并入环
      let pre = (minj - 1 + (i + 1)) % (i + 1);
      let post = (minj + 1) % (i + 1);
      let curNode = nodes[minj];
      let insNode = nodes[mink];
      let preNode = nodes[pre];
      let postNode = nodes[post];

      let tmp = nodes[mink];
      nodes[mink] = nodes[i + 1];
      nodes[i + 1] = tmp;
      if (mat[preNode][insNode] < mat[postNode][insNode]) {
        for (let j = i + 1; j > minj; j--) {
          nodes[j] = nodes[j - 1];
        }
        nodes[minj] = tmp;
        graph.nodes()[0].datum.answer += mat[preNode][insNode] + mat[insNode][curNode] - mat[preNode][curNode];
        for (let edge of graph.edges()) {
          if (
            (edge.source == preNode && edge.target == insNode) ||
            (edge.source == insNode && edge.target == curNode)
          ) {
            edge.datum.chosen = 1;
          }
          if (edge.source == preNode && edge.target == curNode) {
            edge.datum.chosen = 0;
          }
        }
      } else {
        for (let j = i + 1; j > minj + 1; j--) {
          nodes[j] = nodes[j - 1];
        }
        nodes[minj + 1] = tmp;
        graph.nodes()[0].datum.answer += mat[postNode][insNode] + mat[insNode][curNode] - mat[postNode][curNode];
        for (let edge of graph.edges()) {
          if (
            (edge.source == curNode && edge.target == insNode) ||
            (edge.source == insNode && edge.target == postNode)
          ) {
            edge.datum.chosen = 1;
          }
          if (edge.source == curNode && edge.target == postNode) {
            edge.datum.chosen = 0;
          }
        }
      }
      yield {
        graph: graph,
        codePosition: new Map<string, number>([["pseudo", 2]])
      };
    }
  }

  run(graph: Graph) {
    return this.salesmanCheaperAlgo(graph);
  }
}

export { SalesmanCheaperAlgo };
