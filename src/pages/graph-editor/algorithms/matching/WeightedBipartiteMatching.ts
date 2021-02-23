import { Queue } from "../../utils/DataStructure";
import { GraphAlgorithm, ParameterDescriptor, Step } from "../../GraphAlgorithm";
import { BipartiteMatrix, Node, Edge, Graph, NodeEdgeList } from "../../GraphStructure";

class KuhnMunkres extends GraphAlgorithm {
  // constructor() {
  //   super("KuhnMunkres Algorithm", "Kuhn-Munkres algorithm for Maximum Weighted Matching in Bipartite Graph");
  // }

  id() {
    return "mwbm_km";
  }

  private que: Queue<number> = new Queue<number>();

  private n: number = 0;
  private w: number[][] = [];
  private lx: number[] = [];
  private ly: number[] = [];
  private inS: boolean[] = [];
  private inT: boolean[] = [];
  private matchx: number[] = [];
  private matchy: number[] = [];
  private slackv: number[] = [];
  private slackx: number[] = [];
  private markx: number[] = [];

  private X: Node[];
  private Y: Node[];
  private edges: Edge[];

  clear(buf: any[], val: any = -1, cnt: number = this.n) {
    for (let _ = 0; _ < cnt; ++_) buf[_] = val;
  }

  addToS(x: number) {
    this.que.push(x);
    this.inS[x] = true;
    for (let y = 0; y < this.n; ++y) {
      let tmp: number = this.lx[x] + this.ly[y] - this.w[x][y];
      if (tmp < this.slackv[y]) {
        this.slackv[y] = tmp;
        this.slackx[y] = x;
      }
    }
  }

  assert() {
    for (let x = 0; x < this.n; ++x)
      for (let y = 0; y < this.n; ++y)
        if (this.lx[x] + this.ly[y] < this.w[x][y]) throw new Error(`algo KM : assertion failed (x = ${x}, y = ${y})`);
  }

  is_valid(x: number, y: number): boolean {
    return this.lx[x] + this.ly[y] === this.w[x][y];
  }

  is_matched(e: Edge): boolean {
    return this.matchx[e.source] === e.target - this.n;
  }

  is_marked(e: Edge): boolean {
    return this.markx[e.source] === e.target - this.n;
  }

  report(): NodeEdgeList {
    //this.assert();

    this.edges.forEach(e =>
      Object.assign(e.datum, {
        matched: this.is_matched(e), // used currently
        marked: this.is_marked(e), // to be used
        valid: this.is_valid(e.source, e.target - this.n) // satisfing l[x] + l[y] = w[x][y]
      })
    );
    this.X.forEach((n, i) =>
      Object.assign(n.datum, {
        match: this.matchx[i] === -1 ? -1 : this.matchx[i] + this.n,
        in: this.inS[i],
        l: this.lx[i]
      })
    );
    this.Y.forEach((n, i) =>
      Object.assign(n.datum, {
        match: this.matchy[i],
        in: this.inT[i],
        l: this.ly[i]
      })
    );
    this.clear(this.markx);

    return new NodeEdgeList(this.X.concat(this.Y), this.edges);
  }

  getStep(lineId: number): Step {
    return {
      graph: this.report(),
      codePosition: new Map<string, number>([["pseudo", lineId]])
    };
  }

  *flip(y: number) {
    this.markx[this.slackx[y]] = y;
    if (this.matchx[this.slackx[y]] !== -1) yield* this.flip(this.matchx[this.slackx[y]]);
    else yield this.getStep(18); // found augmenting path
    (this.matchy[y] = this.slackx[y]), (this.matchx[this.slackx[y]] = y);
  }

  *extand() {
    while (!this.que.empty()) {
      let x = this.que.front();
      this.que.pop();
      for (let y = 0; y < this.n; ++y) {
        if (!this.is_valid(x, y) || this.inT[y]) continue;
        this.inT[y] = true;
        this.slackx[y] = x;
        if (this.matchy[y] === -1) {
          yield* this.flip(y);
          return true;
        }
        if (!this.inS[this.matchy[y]]) {
          this.addToS(this.matchy[y]);
          yield this.getStep(12); // added to S
        }
      }
    }
    return false;
  }

  *run(graph: Graph): Generator<Step> {
    if (!(graph instanceof BipartiteMatrix)) throw new Error();
    this.n = graph.mat.length;
    if (this.n !== graph.mat[0].length) throw new Error("|X| != |Y|");
    this.w = graph.mat.map(line => line.map(e => e.weight));
    this.lx = Array.from({ length: this.n }, (_, x) => {
      let res = -Infinity;
      this.w[x].forEach(v => (res = Math.max(res, v)));
      return res;
    });
    this.ly = Array.from({ length: this.n }, () => 0);
    (this.X = graph.leftSide), (this.Y = graph.rightSide), (this.edges = graph.edges());
    this.clear(this.matchx), this.clear(this.matchy), this.clear(this.markx);
    yield this.getStep(6); // inited

    for (let x = 0; x < this.n; ++x) {
      this.clear(this.slackx), this.clear(this.slackv, Infinity);
      this.clear(this.inS, false), this.clear(this.inT, false);
      this.que.clear();
      this.addToS(x);
      yield this.getStep(8); // new x
      while (!(yield* this.extand())) {
        let delta: number = Infinity;
        for (let y = 0; y < this.n; ++y) if (!this.inT[y]) delta = Math.min(delta, this.slackv[y]);
        for (let i = 0; i < this.n; ++i) {
          if (this.inS[i]) this.lx[i] -= delta;
          if (this.inT[i]) this.ly[i] += delta;
          else this.slackv[i] -= delta;
        }
        yield this.getStep(16); // adjusted
        let break_flag: boolean = false;
        for (let y = 0; y < this.n; ++y) {
          if (!this.inT[y] && this.slackv[y] === 0) {
            this.inT[y] = true;
            if (this.matchy[y] === -1) {
              yield* this.flip(y);
              break_flag = true;
              break;
            }
            this.addToS(this.matchy[y]);
            yield this.getStep(12); // added to S
          }
        }
        if (break_flag) break;
      }
      yield this.getStep(19); // augmented
    }
    let res = 0;
    for (let i = 0; i < this.n; ++i) res += this.lx[i] + this.ly[i];
    //console.log(`algo KuhnMunkres : {weight: ${res}}`);
    yield this.getStep(21); // return
    return { weight: res };
  }
}

export { KuhnMunkres };
