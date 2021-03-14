import { GraphAlgorithm, ParameterDescriptor, parseRangedInt, Step } from "../../GraphAlgorithm";
import { Edge, EdgeList, Graph, Node } from "../../GraphStructure";
import { Queue } from "../../utils/DataStructure";
import { NetworkFlowBase, _Edge, v, iv } from "./Common";
import { EdgeRenderHint, NodeRenderHint } from "@/pages/graph-editor/display/CanvasGraphRenderer";

class ZkwMCF extends GraphAlgorithm {
  // constructor() {
  //   super("ZkwMCF", "Zkw's algorithm for Minimum-Cost Network Flow");
  // }

  id() {
    return "mcf_zkw";
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
      },
      {
        name: "flow_limit",
        parser: (text, _) => {
          if (text === undefined || text === "") return undefined;
          if (["inf", "infty", "infinity"].includes(text)) return Infinity;
          let res = Number(text);
          if (isNaN(res)) throw new Error(".input.error.nan");
          if (res < 0) throw new Error(".input.error.out_of_range");
          return res;
        }
      }
    ];
  }

  nodeRenderPatcher(): Partial<NodeRenderHint> {
    return {
      borderColor: node => (node.datum.dist !== Infinity ? "#77ff77" : "#bbbbbb"),
      fillingColor: node => (node.datum.dist !== Infinity ? "#bbffbb" : "#dddddd"),
      floatingData: node => `(${node.id},${iv(node.datum.dist)})`
    };
  }

  edgeRenderPatcher(): Partial<EdgeRenderHint> {
    return {
      thickness: edge => (edge.datum.mark !== 0 ? 5 : 3),
      color: edge => {
        if (edge.datum.mark) return edge.datum.mark === 1 ? "#33ff33" : "#ff3333";
        if (edge.datum.valid) return "#bbffbb";
        return "#dddddd";
      },
      floatingData: edge => `(${v(edge.datum.flow)},${v(edge.datum.used)}),${v(edge.datum.cost)}`
    };
  }

  private que: Queue<number> = new Queue<number>();

  private E: NetworkFlowBase;
  private V: Node[] = [];
  private n: number = 0;
  private S: number;
  private T: number;
  private maxflow: number = 0;
  private mincost: number = 0;

  private dis: number[] = [];
  private vis: boolean[] = [];

  clear(buf: any[], val: any = -1, cnt: number = this.n) {
    for (let _ = 0; _ < cnt; ++_) buf[_] = val;
  }

  nodedatum = (i: number) => ({ dist: this.dis[i] });

  _valid(pos: number, e: _Edge): boolean {
    return !this.vis[e.to] && this.dis[pos] === this.dis[e.to] + e.cost && e.flow > 0;
  }

  is_valid(e: Edge): number {
    if (this.dis[e.source] === this.dis[e.target] + e.datum.cost) return 1;
    return 0;
  }

  report(): Graph {
    let rE = this.E.edges();
    rE.forEach(e =>
      Object.assign(e.datum, {
        valid: this.is_valid(e)
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
        ["$mincost$", "number", this.mincost],
        ["$dist$", "array", this.dis]
      ]
    };
  }

  spfa(): boolean {
    this.clear(this.dis, Infinity);
    this.clear(this.vis, false);
    this.que.clear();

    this.dis[this.T] = 0;
    this.vis[this.T] = true;
    this.que.push(this.T);
    while (!this.que.empty()) {
      let pos = this.que.front();
      this.que.pop();
      this.vis[pos] = false;
      let e: _Edge, re: _Edge, tmp: number;
      for (let i = this.E.head[pos]; i !== -1; i = e.next) {
        e = this.E.edge[i];
        re = this.E.edge[i ^ 1];
        tmp = this.dis[pos] + re.cost;
        if (re.flow > 0 && this.dis[e.to] > tmp) {
          this.dis[e.to] = tmp;
          if (!this.vis[e.to]) {
            this.vis[e.to] = true;
            this.que.push(e.to);
          }
        }
      }
    }

    return this.dis[this.S] !== Infinity;
  }

  *dfs(pos: number, lim: number) {
    if (pos === this.T) {
      yield this.getStep(24); // reached t
      return lim;
    }
    this.vis[pos] = true;
    let e: _Edge, re: _Edge;
    let res = 0;
    for (let i = this.E.head[pos]; i !== -1; i = e.next) {
      e = this.E.edge[i];
      re = this.E.edge[i ^ 1];
      if (this._valid(pos, e)) {
        e.mark = true;
        let tmp = yield* this.dfs(e.to, Math.min(lim, e.flow));
        (e.flow -= tmp), (re.flow += tmp);
        (lim -= tmp), (res += tmp);
        e.mark = false;
      }
      if (!lim) break;
    }
    return res;
  }

  *run(G: Graph, Spos: number, Tpos: number, limit: number = Infinity): Generator<Step> {
    this.V = G.nodes();
    this.n = this.V.length;
    this.E = new NetworkFlowBase(G, this.n);
    (this.S = Spos), (this.T = Tpos);
    (this.maxflow = 0), (this.mincost = 0);
    yield this.getStep(34); // inited
    while (limit > 0 && this.spfa()) {
      yield this.getStep(35); // built sssp graph
      do {
        this.clear(this.vis, false);
        let delta = yield* this.dfs(this.S, limit);
        limit -= delta;
        this.maxflow += delta;
        this.mincost += delta * this.dis[this.S];
        yield this.getStep(40); // augmented
      } while (this.vis[this.T]);
    }
    //console.log(`algo ZkwMCF : {flow: ${flow}, cost: ${cost}`);
    yield this.getStep(42); // return
    return { flow: this.maxflow, cost: this.mincost };
  }
}

export { ZkwMCF };
