import { GraphAlgorithm, ParameterDescriptor, parseRangedInt, Step } from "../../GraphAlgorithm";
import { EdgeList, Graph, Node } from "../../GraphStructure";
import { Queue } from "../../utils/DataStructure";
import { NetworkFlowBase, _Edge } from "./Common";
import { EdgeRenderHint, NodeRenderHint } from "@/pages/graph-editor/display/CanvasGraphRenderer";

class EdmondsKarp extends GraphAlgorithm {
  // constructor() {
  //   super("EdmondsKarp", "Edmonds-Karp algorithm for Maximum Network Flow");
  // }

  id() {
    return "mf_ek";
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
    return {};
  }

  edgeRenderPatcher(): Partial<EdgeRenderHint> {
    return {
      thickness: edge => (edge.datum.mark !== 0 ? 5 : undefined),
      color: edge => (edge.datum.mark === 1 ? "#ff0000" : edge.datum.mark === -1 ? "#00ff00" : undefined),
      floatingData: edge => `(${edge.datum.flow},${edge.datum.used})`
    };
  }

  private que: Queue<number> = new Queue<number>();

  private E: NetworkFlowBase;
  private V: Node[] = [];
  private n: number = 0;
  private S: number;
  private T: number;
  private maxflow: number = 0;

  private pre: number[] = [];
  private eid: number[] = [];
  private flw: number[] = [];

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

  mark() {
    for (let pos = this.T; pos !== this.S; pos = this.pre[pos]) this.E.edge[this.eid[pos]].mark = true;
  }

  flip(): number {
    let res = this.flw[this.T];
    for (let pos = this.T; pos !== this.S; pos = this.pre[pos]) {
      this.E.edge[this.eid[pos]].flow -= res;
      this.E.edge[this.eid[pos] ^ 1].flow += res;
    }
    return res;
  }

  bfs(): boolean {
    this.que.clear();
    this.clear(this.eid), this.clear(this.pre), this.clear(this.flw, Infinity);

    this.que.push(this.S);
    while (!this.que.empty()) {
      let pos = this.que.front();
      this.que.pop();
      if (pos === this.T) {
        this.mark();
        return true;
      }
      let e: _Edge;
      for (let i = this.E.head[pos]; i !== -1; i = e.next) {
        e = this.E.edge[i];
        if (this.pre[e.to] === -1 && e.flow > 0) {
          this.que.push(e.to);
          this.pre[e.to] = pos;
          this.eid[e.to] = i;
          this.flw[e.to] = Math.min(this.flw[pos], e.flow);
        }
      }
    }

    return false;
  }

  *run(G: Graph, Spos: number, Tpos: number): Generator<Step> {
    this.V = G.nodes();
    this.n = this.V.length;
    this.E = new NetworkFlowBase(G, this.n);
    (this.S = Spos), (this.T = Tpos);
    let delta = 0;
    this.maxflow = 0;
    yield this.getStep(19); // inited
    while (this.bfs()) {
      yield this.getStep(20); // found augmenting path
      delta = this.flip();
      this.maxflow += delta;
      yield this.getStep(23); // augmented
    }
    //console.log(`algo EdmondsKarp : {flow: ${flow}}`);
    yield this.getStep(24); // return
    return { flow: this.maxflow };
  }
}

export { EdmondsKarp };
