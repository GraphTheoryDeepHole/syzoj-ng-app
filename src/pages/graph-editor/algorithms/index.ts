import { GraphAlgorithm } from "@/pages/graph-editor/GraphAlgorithm";
import { Dijkstra } from "@/pages/graph-editor/algorithms/Dijkstra";
import codeMap from "./codeMap";

const algorithms = new Map<string, () => GraphAlgorithm>([["dijkstra", () => new Dijkstra()]]);

const newAlgorithm = name => algorithms.get(name)();

export { algorithms, codeMap, newAlgorithm };
