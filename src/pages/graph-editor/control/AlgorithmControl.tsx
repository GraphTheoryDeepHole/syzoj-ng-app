import { Button, Card, Comment, Dropdown, Form, Grid, Header, Placeholder, Segment } from "semantic-ui-react";
import React, { Reducer, useEffect, useReducer, useState } from "react";
import { algorithms, codeMap, newAlgorithm } from "@/pages/graph-editor/algorithms";
import MarkdownContent from "@/markdown/MarkdownContent";
import { useLocalizer } from "@/utils/hooks";
import { GraphAlgorithm, ParameterDescriptor, Step } from "@/pages/graph-editor/GraphAlgorithm";
import { Graph } from "@/pages/graph-editor/GraphStructure";
import cloneDeep from "lodash.clonedeep";
import style from "./AlgorithmControl.module.less";

interface AlgorithmControlProps {
  dataGraph: Graph;
  setDisplayedGraph: (g: Graph) => void;
  onAlgorithmChanged: (algorithm: string) => void;
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
      parseError: []
    });
    if (this.descriptors) {
      for (let i = 0; i < this.descriptors.length; i++) {
        this.changeText({ index: i, text: "" });
      }
    }
  }

  public changeAlgorithm(args: { name: string }) {
    this.descriptors = newAlgorithm(args.name).parameters();
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
      this.state = "ok";
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

  // Utility functions
  const flipAuto = () => setAuto(!auto);
  const onAlgorithmChanged = (_, { value }) => {
    paraDispatch({ type: "changeAlgorithm", name: value });
    runnerDispatch({ type: "changeAlgorithm", name: value });
    props.onAlgorithmChanged(value);
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
  const mapCodeLines = (outerIndexes: number[]) => (e, i) => (
    <Comment key={i}>
      {typeof e === "string" ? (
        <>
          <Comment.Text
            className={
              runnerState != "stop" && steps[currentStep]?.codePosition?.get(codeType) === i
                ? style.currentStep
                : style.step
            }
          >
            <MarkdownContent content={e} />
          </Comment.Text>
        </>
      ) : (
        <Comment.Group>{e.map(mapCodeLines([...outerIndexes, i]))}</Comment.Group>
      )}
    </Comment>
  );
  const stepDisplay = () => (
    <Grid.Row>
      <Grid.Column width={16}>
        <Card fluid>
          <Card.Content>
            <Card.Header>Steps</Card.Header>
          </Card.Content>
          <Card.Content>
            {algorithm && codeType ? (
              <Comment.Group>{codeMap[algorithm.id()][codeType].map(mapCodeLines([]))}</Comment.Group>
            ) : (
              <Placeholder fluid>
                {Array.from({ length: 7 }, (_, i) => (
                  <Placeholder.Line key={i} />
                ))}
              </Placeholder>
            )}
          </Card.Content>
        </Card>
      </Grid.Column>
    </Grid.Row>
  );
  // -----

  // -----
  const parameterInputs = () => {
    if (descriptors == null || descriptors.length === 0) return null;
    const onChange = index => (_, { value }) => {
      paraDispatch({ type: "changeText", index, text: value });
    };
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Card>
            <Card.Content>
              <Card.Header>{_(".ui.parameters")}</Card.Header>
            </Card.Content>
            <Card.Content>
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
            </Card.Content>
          </Card>
        </Grid.Column>
      </Grid.Row>
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
    if (parameterState === "ok") {
      return runnerState === "stop"
        ? button("play", _(".ui.start"), "green", runAlgorithm)
        : button("sync", _(".ui.restart"), "blue", runAlgorithm);
    } else {
      return button("close", _(".ui.check_parameters"), "yellow");
    }
  };
  const mainController = () => (
    <>
      <Grid.Row>
        <Grid.Column width={6}>{algorithmSelector()}</Grid.Column>
        <Grid.Column width={3}>{middleButton()}</Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column width={6}>{codeTypeSelector()}</Grid.Column>
        <Grid.Column width={3}>
          {auto ? (
            <Button fluid icon="pause" content={_(".ui.pause")} onClick={flipAuto} />
          ) : (
            <Button fluid icon="play" content={_(".ui.autorun")} onClick={flipAuto} />
          )}
        </Grid.Column>
        <Grid.Column width={7}>
          <Button.Group fluid>
            <Button labelPosition="left" icon="left chevron" content={_(".ui.previous_step")} onClick={previousStep} />
            <Button labelPosition="right" icon="right chevron" content={_(".ui.next_step")} onClick={nextStep} />
          </Button.Group>
        </Grid.Column>
      </Grid.Row>
    </>
  );
  // -----

  // Main component
  return (
    <>
      <Header as="h4" block attached="top" icon="terminal" content="algorithm" />
      <Segment attached="bottom">
        <Grid padded>
          {mainController()}
          {stepDisplay()}
          {parameterInputs()}
        </Grid>
      </Segment>
    </>
  );
};

export default React.memo(AlgorithmControl);
