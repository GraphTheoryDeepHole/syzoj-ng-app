import React, { useEffect, useReducer } from "react";
import { Edge, Graph, Node } from "../GraphStructure";
import { SimulationLinkDatum, SimulationNodeDatum } from "d3-force";
import { Header, Segment } from "semantic-ui-react";
import { useResizeDetector } from "react-resize-detector";
import CanvasGraphRenderer, { EdgeRenderHint, GeneralRenderHint, NodeRenderHint } from "./CanvasGraphRenderer";

interface GraphDisplayProp {
  dataGraph: Graph;
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
  const { dataGraph, generalRenderHint, nodeRenderHint, edgeRenderHint } = props;
  const reducer = (renderer, action) => {
    console.log(action);
    renderer[action.type](action);
    // Should we copy the renderer to toggle react rerender?
    return renderer;
  };
  const [renderer, dispatch] = useReducer(reducer, new CanvasGraphRenderer());
  const { width, ref: resizeRef } = useResizeDetector<HTMLDivElement>();
  const height = width * 0.625; // 16:10

  useEffect(() => {
    dispatch({ type: "updateGraph", graph: dataGraph, newGraph: true });
  }, [dataGraph]);

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
      <Header as="h4" block attached="top" icon="search" content="editor" />
      <Segment attached="bottom">
        <div style={{ width: "100%" }} ref={resizeRef}>
          <canvas width={width} height={String(height)} ref={onCanvasMount} />
        </div>
      </Segment>
    </>
  );
};

export default React.memo(GraphDisplay);
