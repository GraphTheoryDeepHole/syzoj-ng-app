import { GraphAlgorithm } from "@/pages/graph-editor/GraphAlgorithm";
import { Dijkstra } from "@/pages/graph-editor/algorithms/Dijkstra";
import codeMap from "./codeMap";
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
  ["dijkstra", () => new Dijkstra()],
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

const newAlgorithm = name => algorithms.get(name)();

export { algorithms, codeMap, newAlgorithm };
