export interface Node {
  readonly id: number;
  datum: any;
}

export interface Edge {
  readonly source: number;
  readonly target: number;
  datum: any;
}

export interface Graph {
  nodes(): Node[];

  edges(): Edge[];
}

export function hasSelfLoop(g: Graph) {
  return g.edges().some(edge => edge.source === edge.target);
}

export function hasMultipleEdges(g: Graph) {
  let edgeSet = Array.from({ length: g.nodes().length }, () => new Set<number>());
  return g.edges().some(({ source: s, target: t }) => edgeSet[s].size === edgeSet[s].add(t).size);
}

const emptyObject = () => ({});

/**
 * Generate random graph
 * @param random The random number generator for EDGES. By default it will generate positive integers smaller than 100.
 * @param edge_mapper The return value will be the datum field of Edge. if weighted is true, then v is a random number
 * generated by random, or v is 0. By default, it will return v for weighted graph and undefined for unweighted graph.
 */
export function fromRandom(
  node_count: number,
  edge_count: number,
  directed: boolean,
  allow_multiple_edge: boolean,
  weighted: boolean,
  node_mapper: (id: number) => Object = emptyObject,
  random?: () => number,
  edge_mapper: (s: number, t: number, v: number) => Object = (s, t, v) => ({ weight: v })
): Graph {
  let randint: (limit: number) => number = limit => Math.floor(Math.random() * limit);
  if (!random) random = randint.bind(this, 100);
  let nodes = Array.from<any, Node>({ length: node_count }, (_, i) => ({ id: i, datum: node_mapper(i) }));
  let edgeCache = allow_multiple_edge || Array.from({ length: node_count }, () => new Set<number>());
  let edges = [];
  while (edge_count > 0) {
    let s = randint(node_count),
      t = randint(node_count);
    if (!directed) {
      s = Math.min(s, t);
      t = Math.max(s, t);
    }
    if (!allow_multiple_edge && edgeCache[s].has(t)) continue;
    edges.push({ source: s, target: t, datum: weighted ? edge_mapper(s, t, random()) : {} });
    edgeCache[s].add(t);
    --edge_count;
  }
  return new NodeEdgeList(nodes, edges);
}

export class NodeEdgeList implements Graph {
  constructor(private _nodes: Node[], private _edges: Edge[]) {}

  static from(g: Graph) {
    return new NodeEdgeList(g.nodes(), g.edges());
  }

  edges(): Edge[] {
    return this._edges;
  }

  nodes(): Node[] {
    return this._nodes;
  }
}

export class EdgeList extends NodeEdgeList implements Graph {
  constructor(public nodeCount: number, edges: Edge[], node_data: (index: number) => Object = emptyObject) {
    super(
      Array.from({ length: nodeCount }, (_, id) => ({ id, datum: node_data(id) })),
      edges
    );
  }
}

export class AdjacencyMatrix implements Graph {
  private readonly node_count;
  private readonly _nodes: Node[];
  private _edges: Edge[];

  constructor(public mat: any[][], public directed: boolean, node_generator: (index: number) => Object = emptyObject) {
    this.node_count = mat.length;
    if (mat.some(line => line.length !== this.node_count)) {
      throw new Error();
    }
    if (!directed && mat.some((line, i) => line.some((edge, j) => edge !== mat[j][i]))) {
      throw new Error();
    }
    this._nodes = Array.from({ length: this.node_count }, (_, id) => ({ id, datum: node_generator(id) }));
  }

  static from(g: Graph, directed: boolean) {
    let nodes = g.nodes(),
      edges = g.edges();
    let mat: any[][] = Array.from({ length: nodes.length }, () =>
      Array.from({ length: nodes.length }, () => undefined)
    );
    let trySet: (x: number, y: number, d: any) => void = (x, y, d) => {
      if (mat[x][y]) throw new Error();
      mat[x][y] = d;
    };
    for (let edge of edges) {
      let { source: s, target: t, datum: d } = edge;
      trySet(s, t, d);
      if (!directed) trySet(t, s, d);
    }
    return new AdjacencyMatrix(mat, directed, i => nodes[i].datum);
  }

  edges(): Edge[] {
    if (!this._edges) {
      let nc = this.node_count;
      this._edges = [];
      for (let i = 0; i < nc; i++)
        for (let j = this.directed ? 0 : i; j < nc; j++)
          if (this.mat[i][j]) this._edges.push({ source: i, target: j, datum: this.mat[i][j] });
    }
    return this._edges;
  }

  nodes(): Node[] {
    return this._nodes;
  }

  get(x: number, y: number) {
    return this.mat[x][y];
  }

  set(x: number, y: number, a: any) {
    this.mat[x][y] = a;
  }
}

export class AdjacencyList implements Graph {
  private readonly _nodes;
  private readonly adjacencyList: Edge[][];

  constructor(public adjlist: [number, any][][], node_generator: (index: number) => Object = emptyObject) {
    this.adjacencyList = adjlist.map((line, source) =>
      line.map<Edge>(([target, datum]) => ({ source, target, datum }))
    );
    this._nodes = Array.from({ length: adjlist.length }, (_, id) => ({ id, datum: node_generator(id) }));
  }

  static from(g: Graph, directed: boolean) {
    let nodes = g.nodes(),
      edges = g.edges();
    let adjlist = edges.reduce(
      (prev, { source: s, target: t, datum: d }) => {
        prev[s].push([t, d]);
        if (!directed) prev[t].push([s, d]);
        return prev;
      },
      Array.from<any, [number, any][]>({ length: nodes.length }, () => [])
    );
    return new AdjacencyList(adjlist, i => nodes[i].datum);
  }

  edges(): Edge[] {
    return this.adjacencyList.reduce((prev, curr) => prev.concat(curr));
  }

  nodes(): Node[] {
    return this._nodes;
  }

  adjacentEdges(node: number) {
    return this.adjacencyList[node];
  }
}

/**
 * Node: BipartiteGraph can guarantee that the "side" property of node's datum is "left" or "right".
 */
export class BipartiteGraph implements Graph {
  public leftSide: Node[];
  public rightSide: Node[];

  constructor(
    left_side_count: number,
    right_side_count: number,
    private _edges: Edge[],
    left_side_generator: (index: number) => Object = emptyObject,
    right_side_generator: (index: number) => Object = emptyObject
  ) {
    if (
      this._edges.some(
        ({ source, target }) =>
          (source < left_side_count && target < left_side_count) ||
          (source >= left_side_count && target >= left_side_count)
      )
    ) {
      throw new Error();
    }
    this.leftSide = Array.from({ length: left_side_count }, (_, i) => ({
      id: i,
      datum: Object.assign(left_side_generator(i), { side: "left" })
    }));
    this.rightSide = Array.from({ length: right_side_count }, (_, i) => ({
      id: i + left_side_count,
      datum: Object.assign(right_side_generator(i), { side: "right" })
    }));
  }

  static from(g: Graph, is_left_side: (node: Node) => boolean) {
    let nodes = g.nodes(),
      edges = g.edges();
    let [left, right] = nodes.reduce(
      (prev, node) => {
        if (is_left_side(node)) prev[0].push(node);
        else prev[1].push(node);
        return prev;
      },
      [[], []]
    );
    return new BipartiteGraph(
      left.length,
      right.length,
      edges,
      i => left[i].datum,
      i => right[i].datum
    );
  }

  edges(): Edge[] {
    return this._edges;
  }

  nodes(): Node[] {
    return this.leftSide.concat(this.rightSide);
  }
}