import { Button, Card, Dropdown, Form, Grid, Header, Segment } from "semantic-ui-react";
import React, { Reducer, useEffect, useMemo, useReducer, useState } from "react";
import { algorithms, codeMap, newAlgorithm } from "@/pages/graph-editor/algorithms";
import { useLocalizer } from "@/utils/hooks";
import { GraphAlgorithm, ParameterDescriptor, Step } from "@/pages/graph-editor/GraphAlgorithm";
import { Graph } from "@/pages/graph-editor/GraphStructure";
import cloneDeep from "lodash.clonedeep";
import MarkdownContent from "@/markdown/MarkdownContent";
import { appState } from "@/appState";
import { generateCodeFontEditorOptions } from "@/misc/fonts";

interface AlgorithmControlProps {
  dataGraph: Graph;
  setDisplayedGraph: (g: Graph) => void;
  onAlgorithmChanged: (algorithm: string) => void;
  setCodeType: (type: string) => void;
  setCodePosition: (pos: number) => void;
}

type RunningState = "stop" | "running" | "done";

class AlgorithmRunner {
  public state: RunningState = "stop";
  public steps: Step[] = [];
  public algorithm: GraphAlgorithm;
  public stepGen: Generator<Step>;
  public currentStep: number;
  public stepCount: number;
  public result: any;

  constructor(private setDisplayedGraph: (g: Graph) => void) {}

  public clear() {
    Object.assign(this, {
      state: "stop",
      steps: [],
      stepGen: null,
      currentStep: 0,
      stepCount: 0,
      result: null
    });
  }

  public changeAlgorithm(args: { name: string }) {
    this.clear();
    this.algorithm = newAlgorithm(args.name);
  }

  public start(args: { graph: Graph; para: any[] }) {
    if (this.state != "stop") {
      this.clear();
    }
    this.stepGen = this.algorithm.run(args.graph, ...args.para);
    this.state = "running";
    this.nextStep();
  }

  public previousStep() {
    if (this.state === "stop" || this.currentStep === 0) return;
    --this.currentStep;
  }

  public nextStep() {
    if (this.state === "stop" || (this.state === "done" && this.stepCount === this.currentStep)) return;
    ++this.currentStep;
    if (this.steps[this.currentStep] == null) {
      let stepIter = this.stepGen.next();
      if (stepIter.done) {
        this.state = "done";
        this.stepCount = this.currentStep;
        this.steps[this.currentStep] = this.steps[this.currentStep - 1];
        this.result = cloneDeep(stepIter.value);
      } else {
        this.steps[this.currentStep] = cloneDeep(stepIter.value);
      }
    }
  }
}

type ParameterState = "ok" | "error";

class ParameterManager {
  public parseResult: any[];
  public descriptors: ParameterDescriptor[];
  public inputTexts: string[];
  public parseError: string[];
  public state: ParameterState;

  constructor(private graph: Graph) {}

  clear() {
    Object.assign(this, {
      parseResult: [],
      inputTexts: [],
      parseError: [],
      state: "ok"
    });
    if (this.descriptors) {
      for (let i = 0; i < this.descriptors.length; i++) {
        this.changeText({ index: i, text: "" });
      }
    }
  }

  public changeAlgorithm(args: { name: string }) {
    this.descriptors = newAlgorithm(args.name)?.parameters() && [];
    this.clear();
  }

  public setGraph(args: { graph: Graph }) {
    this.graph = args.graph;
    this.clear();
  }

  public changeText(args: { index: number; text: string }) {
    const { index, text } = args;
    this.inputTexts[index] = text;
    try {
      this.parseResult[index] = this.descriptors[index].parser(text, this.graph);
      this.parseError[index] = null;
      if (this.parseError.every(e => e == null)) this.state = "ok";
    } catch (e) {
      this.parseError[index] = e.message;
      this.state = "error";
    }
  }
}

let AlgorithmControl: React.FC<AlgorithmControlProps> = props => {
  const _ = useLocalizer("graph_editor");

  // States
  const reducer = (state, action) => {
    let newState = Object.assign({}, state);
    Reflect.setPrototypeOf(newState, Reflect.getPrototypeOf(state));
    newState[action.type](action);
    return newState;
  };
  const [runner, runnerDispatch] = useReducer<Reducer<AlgorithmRunner, any>>(
    reducer,
    new AlgorithmRunner(props.setDisplayedGraph)
  );
  const [para, paraDispatch] = useReducer<Reducer<ParameterManager, any>>(
    reducer,
    new ParameterManager(props.dataGraph)
  );
  const { state: runnerState, steps, algorithm, stepGen, currentStep, stepCount, result } = runner;
  const { parseResult, descriptors, inputTexts, parseError, state: parameterState } = para;
  const [auto, setAuto] = useState(false);
  const [codeType, setCodeType] = useState<string>();

  // Clear states when graph changes
  useEffect(() => {
    paraDispatch({ type: "setGraph", graph: props.dataGraph });
    runnerDispatch({ type: "clear" });
  }, [props.dataGraph]);

  // Set displayGraph when currentStep changes
  useEffect(() => {
    props.setDisplayedGraph(steps[currentStep]?.graph);
  }, [steps, currentStep, props.setDisplayedGraph]);

  // Sync code type
  useEffect(() => {
    props.setCodeType(codeType);
  }, [codeType, props.setCodePosition]);

  // Sync code position
  useEffect(() => {
    props.setCodePosition(steps[currentStep]?.codePosition?.get(codeType));
  }, [steps, currentStep, codeType, props.setCodePosition]);

  // Utility functions
  const flipAuto = () => setAuto(!auto);
  const onAlgorithmChanged = (_, { value }) => {
    paraDispatch({ type: "changeAlgorithm", name: value });
    runnerDispatch({ type: "changeAlgorithm", name: value });
    props.onAlgorithmChanged(value);
    props.setDisplayedGraph(null);
  };
  const onCodeTypeChanged = (_, { value }) => {
    setCodeType(value);
  };
  const runAlgorithm = () => {
    if (parameterState != "error") {
      runnerDispatch({ type: "start", graph: props.dataGraph, para: parseResult });
    }
  };
  const previousStep = () => {
    runnerDispatch({ type: "previousStep" });
  };
  const nextStep = () => {
    runnerDispatch({ type: "nextStep" });
  };

  // UI helper
  // -----
  const parameterInputs = () => {
    if (descriptors == null || descriptors.length === 0) return null;
    const onChange = index => (_, { value }) => {
      paraDispatch({ type: "changeText", index, text: value });
    };
    return (
      <>
        <Header as="h4" block attached="top" icon="crosshairs" content={_(".ui.parameters")} />
        <Segment attached="bottom">
          <Form>
            <Form.Group widths={"equal"}>
              {descriptors.map(({ name }, i) => (
                <Form.Input
                  fluid
                  key={name}
                  label={_(`.algo.${algorithm.id()}.para.${name}`)}
                  error={parseError[i] ? _(parseError[i]) : null}
                  value={inputTexts[i]}
                  onChange={onChange(i)}
                />
              ))}
            </Form.Group>
          </Form>
        </Segment>
      </>
    );
  };
  // -----

  // -----
  const algorithmSelector = () => (
    <Dropdown
      placeholder={_(".ui.select_algorithm")}
      fluid
      search
      selection
      clearable
      options={[...algorithms.keys()].map(key => ({
        key,
        text: _(`.algo.${key}.name`),
        value: key
      }))}
      onChange={onAlgorithmChanged}
    />
  );
  const codeTypeSelector = () => (
    <Dropdown
      placeholder={_(".ui.select_code_type")}
      fluid
      search
      selection
      clearable
      options={
        algorithm
          ? Object.keys(codeMap[algorithm.id()]).map(key => ({
              key,
              text: _(`.algo.code_type.${key}`),
              value: key
            }))
          : []
      }
      onChange={onCodeTypeChanged}
    />
  );
  const middleButton = () => {
    const button = (icon, content, color, action?) => (
      <Button fluid labelPosition="left" icon={icon} content={content} color={color} onClick={action} />
    );
    if (algorithm == null) {
      return button("close", _(".ui.no_algorithm"), "yellow");
    } else if (parameterState === "ok") {
      return runnerState === "stop"
        ? button("play", _(".ui.start"), "green", runAlgorithm)
        : button("sync", _(".ui.restart"), "blue", runAlgorithm);
    } else {
      return button("close", _(".ui.check_parameters"), "yellow");
    }
  };
  const runnerInfo = () => {
    let infoStr = _(".ui.runner_" + runnerState);
    if (runnerState == "running") {
      infoStr += "  " + currentStep + _(".ui.step");
    } else if (runnerState == "done") {
      infoStr += `  ${currentStep}/${stepCount}` + _(".ui.step");
    }
    return infoStr;
  };
  const mainController = () => (
    <>
      <Header as="h4" block attached="top" icon="terminal" content="algorithm" />
      <Segment attached="bottom">
        <Grid padded>
          <Grid.Row>{algorithmSelector()}</Grid.Row>
          <Grid.Row>{codeTypeSelector()}</Grid.Row>
          <Grid.Row>{middleButton()}</Grid.Row>
          <Grid.Row>
            {auto ? (
              <Button fluid icon="pause" content={_(".ui.pause")} onClick={flipAuto} />
            ) : (
              <Button fluid icon="play" content={_(".ui.autorun")} onClick={flipAuto} />
            )}
          </Grid.Row>
          <Grid.Row>
            <Button.Group fluid>
              <Button
                labelPosition="left"
                icon="left chevron"
                content={_(".ui.previous_step")}
                onClick={previousStep}
              />
              <Button labelPosition="right" icon="right chevron" content={_(".ui.next_step")} onClick={nextStep} />
            </Button.Group>
          </Grid.Row>
          <Grid.Row>
            <span style={{ width: "100%", textAlign: "center" }}>{runnerInfo()}</span>
          </Grid.Row>
        </Grid>
      </Segment>
    </>
  );
  // -----

  // -----
  const codeOption = useMemo(() => generateCodeFontEditorOptions(appState.locale), [appState.locale]);
  const fallbackRenderer = (data: any) => (
    <span
      style={{
        fontFamily: codeOption.fontFamily,
        fontSize: codeOption.fontSize
      }}
    >
      {JSON.stringify(data)}
    </span>
  );
  const extraDataRenderer: Map<string, (data: any) => JSX.Element> = new Map();
  const extraDataDisplay = () => {
    const extraData = steps[currentStep]?.extraData;
    if (extraData == null) return;
    return (
      <>
        <Header as="h4" block attached="top" icon="database" content="extra data" />
        <Segment attached="bottom">
          {extraData.map(([name, type, data]) => (
            <Card key={name}>
              <Card.Content>
                <Card.Header>
                  <MarkdownContent content={name} />
                </Card.Header>
                <Card.Meta>{`Type: ${type}`}</Card.Meta>
              </Card.Content>
              <Card.Content>{(extraDataRenderer.get(type) ?? fallbackRenderer)(data)}</Card.Content>
            </Card>
          ))}
        </Segment>
      </>
    );
  };
  const resultDisplay = () => {
    if (result == null) return;
    return (
      <>
        <Header as="h4" block attached="top" icon="check" content="result" />
        <Segment color="green" attached="bottom">
          <span
            style={{
              fontFamily: codeOption.fontFamily,
              fontSize: codeOption.fontSize
            }}
          >
            {JSON.stringify(result)}
          </span>
        </Segment>
      </>
    );
  };
  // -----

  // Main component
  return (
    <>
      {mainController()}
      {resultDisplay()}
      {extraDataDisplay()}
      {parameterInputs()}
    </>
  );
};

export default React.memo(AlgorithmControl);
