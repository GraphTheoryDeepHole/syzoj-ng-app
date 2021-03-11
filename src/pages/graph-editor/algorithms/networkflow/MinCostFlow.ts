import { GraphAlgorithm, ParameterDescriptor, parseRangedInt, Step } from "../../GraphAlgorithm";
import { Edge, EdgeList, Graph, Node } from "../../GraphStructure";
import { Queue } from "../../utils/DataStructure";
import { NetworkFlowBase, _Edge } from "./Common";
import { EdgeRenderHint, NodeRenderHint } from "@/pages/graph-editor/display/CanvasGraphRenderer";

class MinCostFlow extends GraphAlgorithm {
  // constructor() {
  //   super("MinCostFlow", "classic algorithm for Minimum-Cost Network Flow");
  // }

  id() {
    return "mcf_classic";
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
      borderColor: node => (node.datum.dist !== Infinity ? "#cccccc" : undefined),
      fillingColor: node => (node.datum.dist !== Infinity ? "#eeeeee" : undefined)
    };
  }

  edgeRenderPatcher(): Partial<EdgeRenderHint> {
    return {
      thickness: edge => (edge.datum.mark !== 0 ? 5 : undefined),
      color: edge => {
        if (edge.datum.mark) return edge.datum.mark === 1 ? "#ff0000" : "#00ff00";
        if (edge.datum.valid) return "#ffaaaa";
        return "#cccccc";
      },
      floatingData: edge => `(${edge.datum.flow},${edge.datum.used}),${edge.datum.cost}`
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
  private pre: number[] = [];
  private eid: number[] = [];
  private vis: boolean[] = [];

  clear(buf: any[], val: any = -1, cnt: number = this.n) {
    for (let _ = 0; _ < cnt; ++_) buf[_] = val;
  }

  nodedatum = (i: number) => ({ dist: this.dis[i] });

  is_valid(e: Edge, eid: number): number {
    if (this.dis[e.source] + this.E.edge[eid * 2].cost === this.dis[e.target]) return 1;
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
        ["$mincost$", "number", this.mincost],
        ["$dist$", "array", this.dis]
      ]
    };
  }

  spfa(): boolean {
    this.clear(this.dis, Infinity);
    this.clear(this.pre), this.clear(this.eid);
    this.clear(this.vis, false);
    this.que.clear();

    this.dis[this.S] = 0;
    this.vis[this.S] = true;
    this.que.push(this.S);
    while (!this.que.empty()) {
      let pos = this.que.front();
      this.que.pop();
      this.vis[pos] = false;
      let e: _Edge, tmp: number;
      for (let i = this.E.head[pos]; i !== -1; i = e.next) {
        e = this.E.edge[i];
        tmp = this.dis[pos] + e.cost;
        if (e.flow > 0 && this.dis[e.to] > tmp) {
          this.dis[e.to] = tmp;
          this.eid[e.to] = i;
          this.pre[e.to] = pos;
          if (!this.vis[e.to]) {
            this.vis[e.to] = true;
            this.que.push(e.to);
          }
        }
      }
    }

    return this.dis[this.T] !== Infinity;
  }

  *run(G: Graph, Spos: number, Tpos: number, limit: number = Infinity): Generator<Step> {
    this.V = G.nodes();
    this.n = this.V.length;
    this.E = new NetworkFlowBase(G, this.n);
    (this.S = Spos), (this.T = Tpos);
    (this.maxflow = 0), (this.mincost = 0);
    yield this.getStep(21); // inited
    while (limit > 0 && this.spfa()) {
      let delta = limit;
      let e: _Edge;
      for (let pos = this.T; pos !== this.S; pos = this.pre[pos]) {
        e = this.E.edge[this.eid[pos]];
        delta = Math.min(delta, e.flow);
        e.mark = true;
      }
      yield this.getStep(22); // found augmenting path
      limit -= delta;
      this.maxflow += delta;
      this.mincost += delta * this.dis[this.T];
      for (let pos = this.T; pos !== this.S; pos = this.pre[pos]) {
        this.E.edge[this.eid[pos]].flow -= delta;
        this.E.edge[this.eid[pos] ^ 1].flow += delta;
      }
      yield this.getStep(26); // augmented
    }
    //console.log(`algo MinCostFlow : {flow: ${flow}, cost: ${cost}`);
    yield this.getStep(27); // return
    return { flow: this.maxflow, cost: this.mincost };
  }
}

export { MinCostFlow };
