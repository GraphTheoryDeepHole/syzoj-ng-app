import { Graph } from "./GraphStructure";
import { EdgeRenderHint, NodeRenderHint } from "@/pages/graph-editor/display/CanvasGraphRenderer";

export function isInteger(v: number): boolean {
  return Math.floor(v) === v;
}

// check if res = Number(text) is an integer and res \in [lowerbound, upperbound)
export function parseRangedInt(text: string, lowerbound: number, upperbound: number): number {
  let res = Number(text);
  if (isNaN(res) || !isInteger(res)) throw new Error(".input.error.not_an_integer");
  if (res < lowerbound || res >= upperbound) throw new Error(".input.error.out_of_range");
  return res;
}

export interface ParameterDescriptor {
  readonly name: string;
  readonly parser: (text: string, graph: Graph) => any;
}

class Step {
  /**
   * @param graph The intermediate results of the step of algorithm.
   * @param codePosition Point out the position of code line when executing ot this step. This map contains the [name, position] pairs.
   * For example, the 4th step of pseudocode can be ["pseudo", 4].
   * @param extraData Extra data produced by the algorithm. This array contains the [name, type, data] tuples .name can be a valid markdown string.
   * type suggests the display method of data, such as "map", "stack", "list".
   */
  constructor(
    public readonly graph: Graph,
    public readonly codePosition?: Map<string, number>,
    public readonly extraData?: [string, string, any][]
  ) {}
}

abstract class GraphAlgorithm {
  abstract id(): string;

  abstract run(graph: Graph, ...args: any[]): Generator<Step>;

  // TODO: can be static
  parameters(): ParameterDescriptor[] {
    return [];
  }

  abstract nodeRenderPatcher(): Partial<NodeRenderHint>;

  abstract edgeRenderPatcher(): Partial<EdgeRenderHint>;
}

export { GraphAlgorithm, Step };
