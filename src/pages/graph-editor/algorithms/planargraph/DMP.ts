import { GraphAlgorithm, Step } from "../../GraphAlgorithm";
import { Edge, Graph, Node, NodeEdgeList } from "../../GraphStructure";
import { DMPGraph, Face, Fragment } from "./DMPGraph";
import { EdgeRenderHint, NodeRenderHint } from "@/pages/graph-editor/ui/CanvasGraphRenderer";

function clear<type>(buf: type[], val: type, cnt: number) {
  for (let _ = 0; _ < cnt; ++_) buf[_] = val;
}

class DMP extends GraphAlgorithm {
  // constructor() {
  //   super("DMP", "Demoucron-Malgrange-Pertuiset Algorithm for Planarity Testing");
  // }

  id() {
    return "pt_dmp";
  }

  nodeRenderPatcher(): Partial<NodeRenderHint> {
    return {
      floatingData: node => node.datum.displayId || node.id,
      borderColor: node => (node.datum.tag === 2 ? "#00ff00" : undefined),
      fillingColor: node => (node.datum.active ? undefined : "#eeeeee")
    };
  }

  edgeRenderPatcher(): Partial<EdgeRenderHint> {
    return {
      thickness: edge => (edge.datum.mark ? 5 : undefined),
      color: edge => (edge.datum.mark ? "#ff0000" : edge.datum.tag === 2 ? "#00ff00" : undefined)
    };
  }

  private planarity: boolean;
  private graphs: DMPGraph[] = [];

  split(graph: DMPGraph): DMPGraph[] {
    let res: DMPGraph[] = [];
    let n = graph.nodes().length,
      cnt = 0;
    let dfn: number[] = [];
    let low: number[] = [];
    let stack: number[] = [];
    clear(dfn, 0, n);
    clear(low, 0, n);

    function newBCC(p: number, q: number) {
      let nodeList: number[] = [p];
      let t: number;
      do nodeList.push((t = stack.pop()));
      while (t !== q);
      //console.log(`nodelist: ${nodeList}`);
      res.push(graph.subGraph(nodeList));
    }

    function dfs1(p: number, f: number = -1) {
      low[p] = dfn[p] = ++cnt;
      stack.push(p);
      for (let { target: q } of graph.adjacentEdges(p)) {
        if (q === f) continue;
        if (dfn[q] === 0) {
          dfs1(q, p);
          low[p] = Math.min(low[p], low[q]);
          if (low[q] >= dfn[p]) newBCC(p, q);
        } else low[p] = Math.min(low[p], dfn[q]);
      }
    }

    for (let i = 0; i < n; ++i) if (dfn[i] === 0) dfs1(i);

    return res;
  }

  report(): NodeEdgeList {
    let resNodes: Node[] = [];
    let resEdges: Edge[] = [];
    let tempGraph: NodeEdgeList;

    for (let graph of this.graphs) {
      tempGraph = graph.reMap(resNodes.length);
      resNodes = resNodes.concat(tempGraph.nodes());
      resEdges = resEdges.concat(tempGraph.edges());
    }

    return new NodeEdgeList(resNodes, resEdges);
  }

  getStep(lineId: number, graph: Graph = this.report()): Step {
    return {
      graph,
      codePosition: new Map<string, number>([["pseudo", lineId]])
    };
  }

  *test(G: DMPGraph, quickTest: boolean) {
    yield this.getStep(9); // simplify
    G.simplify();
    yield this.getStep(9); // simplified

    //console.table(G.nodes().map(n=>n.datum.displayId));

    let V = G.nodes();
    let E = G.edges();
    let n = V.length;
    let m = E.length;
    if (n === 0 || m === 0) return true;
    if (quickTest && (n < 5 || m < 9)) return true;
    if (quickTest && m > 3 * n - 6) return false;

    let faces: Face[] = [];
    let fragments: Fragment[] = [];
    let timeTag: number[] = [];
    let curTime: number = 0;
    clear(timeTag, 0, n);

    function embed(e: Edge) {
      e.datum.tag = V[e.source].datum.tag = V[e.target].datum.tag = 2;
    }

    function check(A: number[], B: number[]): boolean {
      ++curTime;
      A.forEach(id => (timeTag[id] = curTime));
      return B.every(id => timeTag[id] === curTime);
    }

    function getFragment(eid: number): Fragment {
      let nodesId: number[] = [];
      let edgesId: number[] = [];
      ++curTime;

      function addEdge(eid: number) {
        edgesId.push(eid);
        E[eid].datum.tag = 1;
      }

      function dfs2(p: number) {
        timeTag[p] = curTime;
        if (V[p].datum.tag === 2) {
          nodesId.push(p);
          return;
        }
        for (let {
          target: q,
          datum: { id: i }
        } of G.adjacentEdges(p)) {
          if (E[i].datum.tag !== 0) continue;
          addEdge(i);
          if (timeTag[q] !== curTime) dfs2(q);
        }
      }

      addEdge(eid);
      dfs2(E[eid].source);
      dfs2(E[eid].target);
      return new Fragment(nodesId, edgesId);
    }

    function getPath(f: Fragment): number[] {
      let res: number[] = [];
      ++curTime;
      f.edgesId.forEach(id => (E[id].datum.tag = 0));

      function dfs3(p: number): boolean {
        timeTag[p] = curTime;
        if (V[p].datum.tag === 2 && p !== f.nodesId[0]) {
          res.push(p);
          return true;
        }
        for (let {
          target: q,
          datum: { id: i }
        } of G.adjacentEdges(p)) {
          if (E[i].datum.tag !== 0 || timeTag[q] == curTime) continue;
          if (dfs3(q)) {
            embed(E[i]);
            res.push(p);
            return true;
          }
        }
        return false;
      }

      dfs3(f.nodesId[0]);
      return res;
    }

    // init face
    embed(E[0]);
    faces.push(new Face([E[0].source, E[0].target]));

    while (faces.length < m - n + 2) {
      E.forEach((e, i) => {
        if (e.datum.tag === 0) fragments.push(getFragment(i));
      });

      fragments.forEach(fr => {
        fr.validFacesId = [];
        faces.forEach((fa, id) => {
          if (check(fa.nodesId, fr.nodesId)) fr.validFacesId.push(id);
        });
      });

      //console.log(G);
      //faces.forEach(f => console.log(f));
      //fragments.forEach(f => console.log(f));

      if (fragments.some(f => f.validFacesId.length === 0)) return false;

      let fragmentId = fragments.findIndex(f => f.validFacesId.length === 1);
      if (fragmentId === -1) fragmentId = 0;
      let fragment = fragments[fragmentId];
      let faceId = fragment.validFacesId[0];
      let face = faces[faceId];

      G.mark(fragment.edgesId);
      yield this.getStep(18); // found fragment
      G.clearMark();

      let path: number[] = getPath(fragment);

      //console.log(path);

      let nodeList1: number[] = [];
      let nodeList2: number[] = [];
      let pos1 = face.nodesId.findIndex(i => i === path[0]);
      let pos2 = face.nodesId.findIndex(i => i === path[path.length - 1]);
      let tot = face.nodesId.length;
      for (let i of path) nodeList1.push(i), nodeList2.push(i);
      function nextId(cur: number): number {
        return cur + 1 === tot ? 0 : cur + 1;
      }
      function prevId(cur: number): number {
        return cur === 0 ? tot - 1 : cur - 1;
      }
      for (let i = nextId(pos2) % tot; i != pos1; i = nextId(i)) nodeList1.push(face.nodesId[i]);
      for (let i = prevId(pos2) % tot; i != pos1; i = prevId(i)) nodeList2.push(face.nodesId[i]);

      faces = faces.filter((_, i) => i !== faceId);
      fragments = fragments.filter((_, i) => i !== fragmentId);
      faces.push(new Face(nodeList1));
      faces.push(new Face(nodeList2));
      yield this.getStep(22); // embedded
    }

    return true;
  }

  *run(G: Graph, quickTest: boolean = true): Generator<Step> {
    this.planarity = true;
    let graph = DMPGraph.from(G);
    yield this.getStep(23, graph); // simplify
    graph.simplify();
    graph.active();
    yield this.getStep(23, graph); // simplified
    this.graphs = this.split(graph);
    yield this.getStep(27); // split
    for (let g of this.graphs) {
      g.active();
      if (!(yield* this.test(g, quickTest))) this.planarity = false;
      //console.log(`graph: ${graph}\nresult: ${planarity}`);
      g.active(false);
      if (quickTest && !this.planarity) break;
    }
    yield this.getStep(32); // return
    return { planarity: this.planarity };
  }
}

export { DMP };
