import { GraphAlgorithm, ParameterDescriptor, parseRangedInt, Step } from "../../GraphAlgorithm";
import { Edge, EdgeList, Graph, Node } from "../../GraphStructure";
import { Queue } from "../../utils/DataStructure";
import { NetworkFlowBase, _Edge } from "./Common";
import { EdgeRenderHint, NodeRenderHint } from "@/pages/graph-editor/display/CanvasGraphRenderer";

class Dinic extends GraphAlgorithm {
  // constructor() {
  //   super("Dinic", "Dinic algorithm for Maximum Network Flow");
  // }

  id() {
    return "mf_dinic";
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
      borderColor: node => (node.datum.depth !== -1 ? "#cccccc" : undefined),
      fillingColor: node => (node.datum.depth !== -1 ? "#eeeeee" : undefined)
    };
  }

  edgeRenderPatcher(): Partial<EdgeRenderHint> {
    return {
      thickness: edge => (edge.datum.mark !== 0 ? 5 : undefined),
      color: edge => {
        if (edge.datum.mark) return edge.datum.mark === 1 ? "#ff0000" : "#00ff00";
        if (edge.datum.valid) return edge.datum.valid === 1 ? "#ffaaaa" : "#aaffaa";
        return "#cccccc";
      },
      floatingData: edge => `(${edge.datum.flow},${edge.datum.used})`
    };
  }

  private que: Queue<number> = new Queue<number>();

  private E: NetworkFlowBase;
  private V: Node[] = [];
  private n: number = 0;
  private S: number;
  private T: number;
  private maxflow: number;

  private dep: number[] = [];
  private cur: number[] = [];

  clear(buf: any[], val: any = -1, cnt: number = this.n) {
    for (let _ = 0; _ < cnt; ++_) buf[_] = val;
  }

  copy(dst: any[], src: any[], cnt: number = this.n) {
    for (let _ = 0; _ < cnt; ++_) dst[_] = src[_];
  }

  nodedatum = (i: number) => ({ depth: this.dep[i] });

  _valid(pos: number, e: _Edge): boolean {
    return this.dep[pos] === this.dep[e.to] + 1 && e.flow > 0;
  }

  is_valid(e: Edge, eid: number): number {
    if (this._valid(e.source, this.E.edge[eid * 2])) return 1;
    if (this._valid(e.target, this.E.edge[eid * 2 + 1])) return -1;
    return 0;
  }

  report(): Graph {
    let rE = this.E.edges();
    rE.forEach((e, i) =>
      Object.assign(e.datum, {
        valid: this.is_valid(e, i)
      })
    );

    return new EdgeList(this.n, rE, this.nodedatum);
  }

  getStep(lineId: number): Step {
    return {
      graph: this.report(),
      codePosition: new Map<string, number>([["pseudo", lineId]]),
      extraData: [
        ["$maxflow$", "number", this.maxflow],
        ["$depth$", "array", this.dep]
      ]
    };
  }

  bfs(): boolean {
    this.copy(this.cur, this.E.head);
    this.clear(this.dep);
    this.que.clear();

    this.que.push(this.T);
    this.dep[this.T] = 0;
    while (!this.que.empty()) {
      let pos = this.que.front();
      this.que.pop();
      if (pos === this.S) return true;
      let e: _Edge, re: _Edge;
      for (let i = this.E.head[pos]; i !== -1; i = e.next) {
        (e = this.E.edge[i]), (re = this.E.edge[i ^ 1]);
        if (this.dep[e.to] === -1 && re.flow > 0) {
          this.dep[e.to] = this.dep[pos] + 1;
          this.que.push(e.to);
        }
      }
    }

    return false;
  }

  *dfs(pos: number, lim: number) {
    if (pos === this.T) {
      yield this.getStep(22); // reached t
      return lim;
    }
    let e: _Edge, re: _Edge;
    let res = 0;
    for (let i = this.cur[pos]; i !== -1; this.cur[pos] = i = e.next) {
      (e = this.E.edge[i]), (re = this.E.edge[i ^ 1]);
      e.mark = true;
      if (this._valid(pos, e)) {
        let tmp = yield* this.dfs(e.to, Math.min(lim, e.flow));
        (e.flow -= tmp), (re.flow += tmp);
        (lim -= tmp), (res += tmp);
      }
      e.mark = false;
      if (!lim) break;
    }
    return res;
  }

  *run(G: Graph, Spos: number, Tpos: number): Generator<Step> {
    this.V = G.nodes();
    this.n = this.V.length;
    this.E = new NetworkFlowBase(G, this.n);
    (this.S = Spos), (this.T = Tpos);
    let delta = 0;
    this.maxflow = 0;
    yield this.getStep(33); // inited
    while (this.bfs()) {
      yield this.getStep(34); // built level graph
      delta = yield* this.dfs(this.S, Infinity);
      this.maxflow += delta;
      yield this.getStep(37); // augmented
    }
    //console.log(`algo Dinic : {flow: ${flow}}`);
    yield this.getStep(38); // return
    return { flow: this.maxflow };
  }
}

export { Dinic };
