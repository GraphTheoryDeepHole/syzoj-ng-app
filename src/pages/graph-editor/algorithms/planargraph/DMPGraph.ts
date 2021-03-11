import { Edge, Graph, Node, NodeEdgeList } from "../../GraphStructure";

export class DMPGraph extends NodeEdgeList implements Graph {
  private adjacencyList: Edge[][];

  refreshAdjList() {
    let adjlist = Array.from<any, [number, any][]>({ length: this._nodes.length }, () => []);
    this._edges.forEach(({ source: s, target: t }, id) => {
      adjlist[s].push([t, { id }]), adjlist[t].push([s, { id }]);
    });
    this.adjacencyList = adjlist.map((line, source) =>
      line.map<Edge>(([target, datum]) => ({ source, target, datum }))
    );
  }

  constructor(_nodes: Node[], _edges: Edge[]) {
    _edges = _edges.map(edge =>
      edge.source <= edge.target ? edge : { source: edge.target, target: edge.source, datum: edge.datum }
    );
    _nodes.forEach((node, id) => Object.assign(node.datum, { displayId: id, tag: 0, active: false }));
    _edges.forEach(edge => Object.assign(edge.datum, { tag: 0, active: false, mark: false }));
    super(_nodes, _edges);
    this.refreshAdjList();
  }

  static from(g: Graph): DMPGraph {
    return new DMPGraph(g.nodes(), g.edges());
  }

  active(flag: boolean = true) {
    this._nodes.forEach(n => (n.datum.active = flag));
    this._edges.forEach(e => (e.datum.active = flag));
  }

  subGraph(nodeList: number[]): DMPGraph {
    let nodeCount = nodeList.length;
    let nodeMapping: number[] = Array.from({ length: this.nodes().length }, () => -1);
    nodeList.forEach((nodeId, i) => (nodeMapping[nodeId] = i));
    let newNodes: Node[] = Array.from({ length: nodeCount }, (_, i) => ({ id: i, datum: {} }));
    let newEdges: Edge[] = [];
    this.edges().forEach(({ source: s, target: t }) => {
      if (nodeMapping[s] !== -1 && nodeMapping[t] !== -1)
        newEdges.push({ source: nodeMapping[s], target: nodeMapping[t], datum: {} });
    });
    let newGraph = new DMPGraph(newNodes, newEdges);
    newGraph.nodes().forEach((node, i) => (node.datum.displayId = this._nodes[nodeList[i]].datum.displayId));
    return newGraph;
  }

  reMap(delta: number): NodeEdgeList {
    return new NodeEdgeList(
      this._nodes.map(({ id: i, datum: d }) => ({ id: i + delta, datum: d })),
      this._edges.map(({ source: s, target: t, datum: d }) => ({ source: s + delta, target: t + delta, datum: d }))
    );
  }

  // remove self loop & mutiple edges
  simplifyEdges(): boolean {
    let edgeCount = this._edges.length;
    this._edges = this._edges.filter(({ source: s, target: t }) => s !== t);
    let edgeSet = Array.from({ length: this._nodes.length }, () => new Set<number>());
    this._edges = this._edges.filter(({ source: s, target: t }) => edgeSet[s].size !== edgeSet[s].add(t).size);
    this.refreshAdjList();
    return this._edges.length !== edgeCount;
  }

  // remove naive nodes (degree <= 2)
  simplifyNodes(): boolean {
    let res: boolean = false;
    this.adjacencyList.every((edges, s) => {
      if (edges.length > 2) return true;
      else res = true;
      if (edges.length === 2) this._edges.push({ source: edges[0].target, target: edges[1].target, datum: {} });
      let newNodes = Array.from({ length: this._nodes.length }, (_, i) => i).filter(i => i !== s);
      let newGraph = this.subGraph(newNodes);
      this._nodes = newGraph.nodes();
      this._edges = newGraph.edges();
      return false;
    });
    if (res) this.refreshAdjList();
    return res;
  }

  simplify() {
    while (this.simplifyEdges() || this.simplifyNodes());
  }

  adjacentEdges(pos: number) {
    return this.adjacencyList[pos];
  }

  mark(edgeList: number[]) {
    edgeList.forEach(id => (this._edges[id].datum.mark = true));
  }

  clearMark() {
    this._edges.forEach(e => (e.datum.mark = false));
  }
}

export class Face {
  constructor(public nodesId: number[] = []) {}
}

export class Fragment {
  public validFacesId: number[] = [];

  constructor(public nodesId: number[] = [], public edgesId: number[] = []) {}
}
