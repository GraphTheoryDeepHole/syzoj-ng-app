import { GraphAlgorithm, Step, ParameterDescriptor, parseRangedInt } from "../../GraphAlgorithm";
import { EdgeList, Graph, Node } from "../../GraphStructure";
import { NetworkFlowBase, _Edge, v } from "./Common";
import { EdgeRenderHint, NodeRenderHint } from "@/pages/graph-editor/display/CanvasGraphRenderer";

class FordFulkerson extends GraphAlgorithm {
  // constructor() {
  //   super("FordFulkerson", "Ford-Fulkerson algorithm for Maximum Network Flow");
  // }

  id() {
    return "mf_ff";
  }

  parameters(): ParameterDescriptor[] {
    return [
      {
        name: "source_vertex",
        parser: (text, graph) => parseRangedInt(text, 0, graph.nodes().length)
      },
      {
        name: "target_vertex",
        parser: (text, graph) => parseRangedInt(text, 0, graph.nodes().length)
      }
    ];
  }

  nodeRenderPatcher(): Partial<NodeRenderHint> {
    return {
      floatingData: node => node.id.toString()
    };
  }

  edgeRenderPatcher(): Partial<EdgeRenderHint> {
    return {
      thickness: edge => (edge.datum.mark !== 0 ? 5 : 3),
      color: edge => (edge.datum.mark === 1 ? "#33ff33" : edge.datum.mark === -1 ? "#ff3333" : "#dddddd"),
      floatingData: edge => `(${v(edge.datum.flow)},${v(edge.datum.used)})`
    };
  }

  private E: NetworkFlowBase;
  private V: Node[] = [];
  private n: number = 0;
  private S: number;
  private T: number;
  private maxflow: number = 0;

  private visit: boolean[] = [];

  clear(buf: any[], val: any = -1, cnt: number = this.n) {
    for (let _ = 0; _ < cnt; ++_) buf[_] = val;
  }

  getStep(lineId: number): Step {
    return {
      graph: new EdgeList(this.n, this.E.edges()),
      codePosition: new Map<string, number>([["pseudo", lineId]]),
      extraData: [["$maxflow$", "number", this.maxflow]]
    };
  }

  *dfs(pos: number, lim: number) {
    this.visit[pos] = true;
    if (pos === this.T) {
      yield this.getStep(16); // found augmenting path
      return lim;
    }
    let e: _Edge, re: _Edge;
    for (let i = this.E.head[pos]; i !== -1; i = e.next) {
      (e = this.E.edge[i]), (re = this.E.edge[i ^ 1]);
      e.mark = true;
      if (!this.visit[e.to] && e.flow > 0) {
        let res = yield* this.dfs(e.to, Math.min(lim, e.flow));
        if (res > 0) {
          (e.flow -= res), (re.flow += res);
          return res;
        }
      }
      e.mark = false;
    }
    return 0;
  }

  *run(G: Graph, Spos: number, Tpos: number): Generator<Step> {
    this.V = G.nodes();
    this.n = this.V.length;
    this.E = new NetworkFlowBase(G, this.n);
    (this.S = Spos), (this.T = Tpos);
    let delta = 0;
    this.maxflow = 0;
    yield this.getStep(15); // inited
    do {
      this.clear(this.visit, false);
      delta = yield* this.dfs(this.S, Infinity);
      this.maxflow += delta;
      yield this.getStep(19); // augmented
    } while (delta > 0);
    //console.log(`algo FordFulkerson : {flow: ${flow}}`);
    yield this.getStep(21); // return
    return { flow: this.maxflow };
  }
}

export { FordFulkerson };
