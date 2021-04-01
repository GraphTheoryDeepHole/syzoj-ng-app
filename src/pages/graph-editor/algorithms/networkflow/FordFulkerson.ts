import { GraphAlgorithm, Step, ParameterDescriptor, parseRangedInt } from "../../GraphAlgorithm";
import { Graph, Node, NodeEdgeList } from "../../GraphStructure";
import { NetworkFlowBase, _Edge, v } from "./Common";
import { EdgeRenderHint, NodeRenderHint } from "@/pages/graph-editor/ui/CanvasGraphRenderer";

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
      fillingColor: node => {
        switch (node.datum.tag) {
          case 1: // checked
            return "#3333ff";
          case 2: // checking
            return "#dddd00";
          case 3: // in stack
            return "#33ff33";
        }
        return "#dddddd";
      },
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
  private delta: number = 0;

  private visit: boolean[] = [];
  private tag: number[] = [];

  clear(buf: any[], val: any = -1, cnt: number = this.n) {
    for (let _ = 0; _ < cnt; ++_) buf[_] = val;
  }

  getStep(stepId: number, clearMark: boolean = false): Step {
    return {
      graph: new NodeEdgeList(
        Array.from({ length: this.n }, (_, id) => ({ id, datum: { tag: this.tag[id] } })),
        this.E.edges(clearMark)
      ),
      codePosition: new Map<string, number>([["pseudo", stepId + 2]]),
      extraData: [
        ["$maxflow$", "number", this.maxflow],
        ["$\\delta$", "number", this.delta]
      ]
    };
  }

  *dfs(pos: number, lim: number) {
    this.visit[pos] = true;
    this.tag[pos] = 2;
    yield this.getStep(1);

    if (pos === this.T) {
      if (lim === 0) return false;
      this.delta = lim;
      this.maxflow += this.delta;
      yield this.getStep(2);
      return true;
    }
    let e: _Edge, re: _Edge;
    for (let i = this.E.head[pos]; i !== -1; i = e.next) {
      (e = this.E.edge[i]), (re = this.E.edge[i ^ 1]);
      if (this.visit[e.to] || e.flow === 0) continue;
      e.mark = true;
      this.tag[pos] = 3;
      if (yield* this.dfs(e.to, Math.min(lim, e.flow))) {
        (e.flow -= this.delta), (re.flow += this.delta);
        return true;
      }
      e.mark = false;
      this.tag[pos] = 2;
      yield this.getStep(1);
    }
    this.tag[pos] = 1;
    return false;
  }

  *run(G: Graph, Spos: number, Tpos: number): Generator<Step> {
    this.V = G.nodes();
    this.n = this.V.length;
    this.E = new NetworkFlowBase(G, this.n);
    (this.S = Spos), (this.T = Tpos);
    this.delta = this.maxflow = 0;
    this.clear(this.tag, 0);
    while (true) {
      this.clear(this.visit, false);
      if (!(yield* this.dfs(this.S, Infinity))) break;
      yield this.getStep(3, true);
      this.clear(this.tag, 0);
      this.delta = 0;
    }
    yield this.getStep(4);
    //console.log(`algo FordFulkerson : {flow: ${flow}}`);
    return { flow: this.maxflow };
  }
}

export { FordFulkerson };
