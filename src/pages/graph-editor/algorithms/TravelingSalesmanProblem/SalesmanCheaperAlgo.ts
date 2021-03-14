import { GraphAlgorithm, Step, ParameterDescriptor } from "../../GraphAlgorithm";
import { EdgeRenderHint, NodeRenderHint } from "../../display/CanvasGraphRenderer";
import { AdjacencyMatrix, Graph } from "../../GraphStructure";

class SalesmanCheaperAlgo extends GraphAlgorithm {
  nodeRenderPatcher(): Partial<NodeRenderHint> {
    return {
      fillingColor: undefined,
      floatingData: node =>
        node.id == 0 && node.datum.answer != undefined ? `${node.id} ans=${node.datum.answer}` : undefined
    };
  }

  edgeRenderPatcher(): Partial<EdgeRenderHint> {
    return {
      color: edge => (edge.datum.chosen ? "#db70db" : undefined),
      floatingData: edge => edge.datum.weight
    };
  }

  id() {
    return "SalesmanCheaperAlgorithm";
  }

  parameters(): ParameterDescriptor[] {
    return [];
  }

  *run(graph: Graph): Generator<Step> {
    let nodes = [];
    let mat = AdjacencyMatrix.from(graph, false).mat;

    for (let i = 0; i < graph.nodes().length; i++) {
      for (let j = 0; j < graph.nodes().length; j++) {
        if (mat[i][j].weight == undefined) {
          mat[i][j].weight = Infinity;
        }
      }
    }

    for (let i = 0; i < graph.nodes().length; i++) {
      mat[i][i] = { weight: 0 };
      nodes[i] = i;
      graph.nodes()[i].datum = { chosen: 0 };
    }
    graph.nodes()[0].datum.answer = 0;

    for (let i = 0; i < graph.edges().length; i++) {
      graph.edges()[i].datum.chosen = 0;
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
          if (mat[nodes[j]][nodes[k]].weight < mat[nodes[minj]][nodes[mink]].weight) {
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
      if (mat[preNode][insNode].weight < mat[postNode][insNode].weight) {
        for (let j = i + 1; j > minj; j--) {
          nodes[j] = nodes[j - 1];
        }
        nodes[minj] = tmp;
        graph.nodes()[0].datum.answer +=
          mat[preNode][insNode].weight + mat[insNode][curNode].weight - mat[preNode][curNode].weight;
      } else {
        for (let j = i + 1; j > minj + 1; j--) {
          nodes[j] = nodes[j - 1];
        }
        nodes[minj + 1] = tmp;
        graph.nodes()[0].datum.answer +=
          mat[postNode][insNode].weight + mat[insNode][curNode].weight - mat[postNode][curNode].weight;
      }

      graph.edges().forEach(e => (e.datum.chosen = 0));
      for (let j = 0; j <= i + 1; j++) {
        for (let edge of graph.edges()) {
          if (
            (edge.source == nodes[j] && edge.target == nodes[(j + 1) % (i + 2)]) ||
            (edge.target == nodes[j] && edge.source == nodes[(j + 1) % (i + 2)])
          ) {
            edge.datum.chosen = 1;
          }
        }
      }
      yield {
        graph: graph,
        codePosition: new Map<string, number>([["pseudo", 1]])
      };
    }

    yield {
      graph: graph,
      codePosition: new Map<string, number>([["pseudo", 2]])
    };
  }
}

export { SalesmanCheaperAlgo };
