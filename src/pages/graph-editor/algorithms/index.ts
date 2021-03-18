import { GraphAlgorithm } from "@/pages/graph-editor/GraphAlgorithm";
import codeMap from "./codeMap";

import { BfsFindPath } from "@/pages/graph-editor/algorithms/BFS&DFS/BfsFindPath";
import { DfsFindPath } from "@/pages/graph-editor/algorithms/BFS&DFS/DfsFindPath";
import { CriticalPath } from "@/pages/graph-editor/algorithms/CriticalPath/CriticalPath";
import { EulerPath } from "@/pages/graph-editor/algorithms/EulerPath/EulerPath";
import { HamiltonPath } from "@/pages/graph-editor/algorithms/HamiltonPath/HamiltonPath";
import { Kruskal } from "@/pages/graph-editor/algorithms/MST/Kruskal";
import { Prim } from "@/pages/graph-editor/algorithms/MST/Prim";
import { Dijkstra } from "@/pages/graph-editor/algorithms/SSSP/Dijkstra";
import { Ford } from "@/pages/graph-editor/algorithms/SSSP/Ford";
import { SalesmanPath } from "@/pages/graph-editor/algorithms/TravelingSalesmanProblem/TravelingSalesmanProb";
import { SalesmanCheaperAlgo } from "@/pages/graph-editor/algorithms/TravelingSalesmanProblem/SalesmanCheaperAlgo";

import { FordFulkerson } from "@/pages/graph-editor/algorithms/networkflow/FordFulkerson";
import { EdmondsKarp } from "@/pages/graph-editor/algorithms/networkflow/EdmondsKarp";
import { Dinic } from "@/pages/graph-editor/algorithms/networkflow/Dinic";
import { MinCostFlow } from "@/pages/graph-editor/algorithms/networkflow/MinCostFlow";
import { ZkwMCF } from "@/pages/graph-editor/algorithms/networkflow/ZkwMCF";
import { HungarianDFS } from "@/pages/graph-editor/algorithms/matching/BipartiteMatching";
import { KuhnMunkres } from "@/pages/graph-editor/algorithms/matching/WeightedBipartiteMatching";
import { Gabow } from "@/pages/graph-editor/algorithms/matching/Matching";
import { DMP } from "@/pages/graph-editor/algorithms/planargraph/DMP";

const algorithms = new Map<string, () => GraphAlgorithm>([
  ["BFS", () => new BfsFindPath()],
  ["DFS", () => new DfsFindPath()],
  ["CriticalPath", () => new CriticalPath()],
  ["EulerPath", () => new EulerPath()],
  ["HamiltonPath", () => new HamiltonPath()],
  ["Kruskal", () => new Kruskal()],
  ["Prim", () => new Prim()],
  ["Dijkstra", () => new Dijkstra()],
  ["Ford", () => new Ford()],
  ["SalesmanProblem", () => new SalesmanPath()],
  ["SalesmanCheaperAlgorithm", () => new SalesmanCheaperAlgo()],
  ["mf_ff", () => new FordFulkerson()],
  ["mf_ek", () => new EdmondsKarp()],
  ["mf_dinic", () => new Dinic()],
  ["mcf_classic", () => new MinCostFlow()],
  ["mcf_zkw", () => new ZkwMCF()],
  ["mbm_hungarian", () => new HungarianDFS()],
  ["mwbm_km", () => new KuhnMunkres()],
  ["mm_gabow", () => new Gabow()],
  ["pt_dmp", () => new DMP()]
]);

const newAlgorithm = name => algorithms.get(name)?.();

export { algorithms, codeMap, newAlgorithm };
