import React, { useEffect, useReducer } from "react";
import { Edge, Graph, Node } from "../GraphStructure";
import { SimulationLinkDatum, SimulationNodeDatum } from "d3-force";
import { Card, Header, Segment } from "semantic-ui-react";
import { useResizeDetector } from "react-resize-detector";
import CanvasGraphRenderer, {
  EdgeRenderHint,
  GeneralRenderHint,
  GraphRenderType,
  NodeRenderHint
} from "./CanvasGraphRenderer";
import legends from "../algorithms/legends.js";
import headerStyle from "@/pages/graph-editor/ui/HeaderIconSizePatcher";
import { useLocalizer } from "@/utils/hooks";
import MarkdownContent from "@/markdown/MarkdownContent";

interface GraphDisplayProp {
  algorithmName: string;
  dataGraph: Graph;
  renderType: GraphRenderType;
  displayedGraph?: Graph;
  generalRenderHint?: GeneralRenderHint;
  nodeRenderHint?: Partial<NodeRenderHint>;
  edgeRenderHint?: Partial<EdgeRenderHint>;
}

interface D3SimulationNode extends SimulationNodeDatum {
  graphNode: Node;
}

function toD3NodeDatum(node: Node): D3SimulationNode {
  return { index: node.id, graphNode: node };
}

interface D3SimulationEdge extends SimulationLinkDatum<any> {
  graphEdge: Edge;
}

function toD3EdgeDatum(edge: Edge): D3SimulationEdge {
  return { source: edge.source, target: edge.target, graphEdge: edge };
}

let GraphDisplay: React.FC<GraphDisplayProp> = props => {
  const _ = useLocalizer("graph_editor");
  const {
    algorithmName,
    dataGraph,
    renderType,
    displayedGraph,
    generalRenderHint,
    nodeRenderHint,
    edgeRenderHint
  } = props;
  const reducer = (renderer, action) => {
    renderer[action.type](action);
    return renderer;
  };
  const [renderer, dispatch] = useReducer(reducer, new CanvasGraphRenderer());
  const { width, ref: resizeRef } = useResizeDetector<HTMLDivElement>();
  const height = width * 0.625; // 16:10

  useEffect(() => {
    dispatch({ type: "updateRenderType", renderType: renderType });
  }, [renderType]);

  useEffect(() => {
    dispatch({ type: "updateGraph", graph: dataGraph, newGraph: true });
  }, [dataGraph]);

  useEffect(() => {
    if (displayedGraph) dispatch({ type: "updateGraph", graph: displayedGraph, newGraph: false });
  }, [displayedGraph]);

  useEffect(() => {
    dispatch({
      type: "updateRenderHint",
      patcher: {
        general: generalRenderHint,
        node: nodeRenderHint,
        edge: edgeRenderHint
      }
    });
  }, [generalRenderHint, nodeRenderHint, edgeRenderHint]);

  const onCanvasMount = canvas => {
    dispatch({ type: "updateCanvas", canvas: canvas });
  };

  return (
    <>
      <Header as="h4" className={headerStyle} block attached="top" icon="search" content={_(".ui.graph_display")} />
      <Segment attached="bottom">
        <div style={{ width: "100%" }} ref={resizeRef}>
          <canvas width={width} height={String(height)} ref={onCanvasMount} />
        </div>
        {legends[algorithmName] && (
          <Card fluid>
            <Card.Content>
              <Card.Header>图例</Card.Header>
              <Card.Description>
                <MarkdownContent content={legends[algorithmName]} />
              </Card.Description>
            </Card.Content>
          </Card>
        )}
      </Segment>
    </>
  );
};

export default React.memo(GraphDisplay);
