import React, { useState } from "react";
import { Header, Menu, Segment } from "semantic-ui-react";
import { Graph } from "@/pages/graph-editor/GraphStructure";
import methods from "@/pages/graph-editor/ui/input-methods";
import { useLocalizer } from "@/utils/hooks";
import { GraphRenderType } from "@/pages/graph-editor/ui/CanvasGraphRenderer";

interface GraphInputPanelProps {
  graph: Graph;
  setGraph: (g: Graph) => void;
  renderType: GraphRenderType;
  setRenderType: (renderType: GraphRenderType) => void;
}

export interface MethodComponent extends React.FC<GraphInputPanelProps> {}

let GraphInputPanel: React.FC<GraphInputPanelProps> = props => {
  const _ = useLocalizer("graph_editor");
  const [selectedMethod, setSelectedMethods] = useState("random");
  const onMenuItemClicked = (_, { name }) => {
    setSelectedMethods(name);
  };
  return (
    <>
      <Header as="h4" block attached="top" icon="edit" content="图的表示方法" />
      <Segment attached="bottom">
        <Menu attached="top" tabular>
          {Array.from(methods.keys(), methodName => (
            <Menu.Item
              key={methodName}
              name={methodName}
              active={selectedMethod === methodName}
              onClick={onMenuItemClicked}
            >
              {_(`.graph.${methodName}.name`)}
            </Menu.Item>
          ))}
        </Menu>
        <Segment attached="bottom">{React.createElement(methods.get(selectedMethod), props)}</Segment>
      </Segment>
    </>
  );
};

export default GraphInputPanel;
