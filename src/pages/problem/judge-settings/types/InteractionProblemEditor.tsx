import React from "react";
import { observer } from "mobx-react";

import style from "./InteractionProblemEditor.module.less";

import { JudgeInfoProcessor, EditorComponentProps, Options } from "../common/interface";

import MetaEditor, { JudgeInfoWithMeta } from "../common/MetaEditor";
import SubtasksEditor, { JudgeInfoWithSubtasks } from "../common/SubtasksEditor";
import ExtraSourceFilesEditor, { JudgeInfoWithExtraSourceFiles } from "../common/ExtraSourceFilesEditor";
import {
  CodeLanguage,
  filterValidCompileAndRunOptions,
  getPreferredCompileAndRunOptions,
  checkCodeFileExtension
} from "@/interfaces/CodeLanguage";
import { useLocalizer } from "@/utils/hooks";
import { Segment, Form, Header, Menu, Input } from "semantic-ui-react";
import TestDataFileSelector from "../common/TestDataFileSelector";
import CodeLanguageAndOptions from "@/components/CodeLanguageAndOptions";

const metaEditorOptions: Options<typeof MetaEditor> = {
  enableTimeMemoryLimit: true,
  enableFileIo: false,
  enableRunSamples: true
};

const subtasksEditorOptions: Options<typeof SubtasksEditor> = {
  enableTimeMemoryLimit: true,
  enableInputFile: true,
  enableOutputFile: false,
  enableUserOutputFilename: false
};

type InteractorInterface = "stdio" | "shm";

interface InteractorConfig {
  interface: InteractorInterface;
  sharedMemorySize?: number;
  language: CodeLanguage;
  compileAndRunOptions: Record<string, unknown>;
  filename: string;
  timeLimit?: number;
  memoryLimit?: number;
}

interface JudgeInfoWithInteractor {
  interactor: InteractorConfig;
}

export type JudgeInfoInteraction = JudgeInfoWithMeta &
  JudgeInfoWithSubtasks &
  JudgeInfoWithInteractor &
  JudgeInfoWithExtraSourceFiles;
type InteractionProblemEditorProps = EditorComponentProps<JudgeInfoInteraction>;

function parseInteractorConfig(
  interactor: Partial<InteractorConfig>,
  testData: ApiTypes.ProblemFileDto[]
): InteractorConfig {
  const language = Object.values(CodeLanguage).includes(interactor.language)
    ? interactor.language
    : Object.values(CodeLanguage)[0];
  return {
    interface: ["stdio", "shm"].includes(interactor.interface) ? interactor.interface : "stdio",
    sharedMemorySize:
      interactor.interface !== "shm"
        ? null
        : Number.isSafeInteger(interactor.sharedMemorySize) &&
          interactor.sharedMemorySize >= 4 &&
          interactor.sharedMemorySize <= 128
        ? interactor.sharedMemorySize
        : 4,
    language: language,
    compileAndRunOptions:
      language === interactor.language
        ? filterValidCompileAndRunOptions(language, interactor.compileAndRunOptions)
        : getPreferredCompileAndRunOptions(language),
    filename:
      interactor.filename && typeof interactor.filename === "string"
        ? interactor.filename
        : (testData.find(file => checkCodeFileExtension(language, file.filename)) || testData[0] || {}).filename || "",
    timeLimit: Number.isSafeInteger(interactor.timeLimit) ? interactor.timeLimit : null,
    memoryLimit: Number.isSafeInteger(interactor.memoryLimit) ? interactor.memoryLimit : null
  };
}

let InteractionProblemEditor: React.FC<InteractionProblemEditorProps> = props => {
  const _ = useLocalizer("problem_judge_settings");

  const interactorInterfaces: InteractorInterface[] = ["stdio", "shm"];
  const interactor = props.judgeInfo.interactor;
  function onUpdateInteractor(delta: Partial<InteractorConfig>) {
    props.onUpdateJudgeInfo(({ interactor }) => ({
      interactor: Object.assign({}, interactor, delta)
    }));
  }

  const normalizeSharedMemorySize = (x: number) => {
    x = Math.round(x);
    if (x < 4) return 4;
    if (x > 128) return 128;
    return x;
  };

  return (
    <>
      <MetaEditor {...props} options={metaEditorOptions} />
      <Form className={style.wrapper}>
        <div className={style.menuWrapper}>
          <Header size="tiny" content={_(".interactor.interactor")} />
          <Menu secondary pointing>
            {interactorInterfaces.map(interactorInterface => (
              <Menu.Item
                key={interactorInterface}
                content={_(`.interactor.interfaces.${interactorInterface}`)}
                active={interactor.interface === interactorInterface}
                onClick={() =>
                  interactor.interface !== interactorInterface &&
                  onUpdateInteractor({
                    interface: interactorInterface,
                    sharedMemorySize: interactorInterface === "shm" ? 4 : null
                  })
                }
              />
            ))}
          </Menu>
        </div>
        <Segment color="grey" className={style.checkerConfig}>
          <div className={style.custom}>
            <TestDataFileSelector
              type="FormSelect"
              label={_(".interactor.filename")}
              placeholder={_(".interactor.filename_no_file")}
              value={interactor.filename}
              testData={props.testData}
              onChange={value => onUpdateInteractor({ filename: value })}
            />
            <div className={style.compileAndRunOptions}>
              <CodeLanguageAndOptions
                elementAfterLanguageSelect={
                  <Form.Field style={{ visibility: interactor.interface === "shm" ? "" : "hidden" }}>
                    <label>{_(".interactor.shm_size")}</label>
                    <Input
                      value={normalizeSharedMemorySize(interactor.sharedMemorySize)}
                      type="number"
                      min={4}
                      max={128}
                      label="MiB"
                      labelPosition="right"
                      onChange={(e, { value }) =>
                        onUpdateInteractor({
                          sharedMemorySize: normalizeSharedMemorySize(Number(value))
                        })
                      }
                    />
                  </Form.Field>
                }
                language={interactor.language}
                compileAndRunOptions={interactor.compileAndRunOptions}
                onUpdateLanguage={newLanguage => onUpdateInteractor({ language: newLanguage })}
                onUpdateCompileAndRunOptions={compileAndRunOptions =>
                  onUpdateInteractor({ compileAndRunOptions: compileAndRunOptions })
                }
              />
            </div>
            <Form.Group>
              <Form.Field width={8}>
                <label>{_(".meta.time_limit")}</label>
                <Input
                  className={style.labeledInput}
                  placeholder={props.judgeInfo["timeLimit"]}
                  value={interactor.timeLimit == null ? "" : interactor.timeLimit}
                  label="ms"
                  labelPosition="right"
                  icon="clock"
                  iconPosition="left"
                  onChange={(e, { value }) =>
                    (value === "" || (Number.isSafeInteger(Number(value)) && Number(value) >= 0)) &&
                    onUpdateInteractor({ timeLimit: value === "" ? null : Number(value) })
                  }
                />
              </Form.Field>
              <Form.Field width={8}>
                <label>{_(".meta.memory_limit")}</label>
                <Input
                  className={style.labeledInput}
                  placeholder={props.judgeInfo["memoryLimit"]}
                  value={interactor.memoryLimit == null ? "" : interactor.memoryLimit}
                  label="MiB"
                  labelPosition="right"
                  icon="microchip"
                  iconPosition="left"
                  onChange={(e, { value }) =>
                    (value === "" || (Number.isSafeInteger(Number(value)) && Number(value) >= 0)) &&
                    onUpdateInteractor({ memoryLimit: value === "" ? null : Number(value) })
                  }
                />
              </Form.Field>
            </Form.Group>
          </div>
        </Segment>
      </Form>
      <SubtasksEditor {...props} options={subtasksEditorOptions} />
      <ExtraSourceFilesEditor {...props} />
    </>
  );
};

InteractionProblemEditor = observer(InteractionProblemEditor);

const judgeInfoProcessor: JudgeInfoProcessor<JudgeInfoInteraction> = {
  parseJudgeInfo(raw, testData) {
    return Object.assign(
      {},
      MetaEditor.parseJudgeInfo(raw, testData, metaEditorOptions),
      {
        interactor: parseInteractorConfig(raw.interactor || {}, testData)
      },
      SubtasksEditor.parseJudgeInfo(raw, testData, subtasksEditorOptions),
      ExtraSourceFilesEditor.parseJudgeInfo(raw, testData)
    );
  },
  normalizeJudgeInfo(judgeInfo) {
    MetaEditor.normalizeJudgeInfo(judgeInfo, metaEditorOptions);
    if (!judgeInfo.interactor.sharedMemorySize) delete judgeInfo.interactor.sharedMemorySize;
    if (judgeInfo.interactor.timeLimit == null) delete judgeInfo.interactor.timeLimit;
    if (judgeInfo.interactor.memoryLimit == null) delete judgeInfo.interactor.memoryLimit;
    SubtasksEditor.normalizeJudgeInfo(judgeInfo, subtasksEditorOptions);
    ExtraSourceFilesEditor.normalizeJudgeInfo(judgeInfo);
  }
};

export default Object.assign(InteractionProblemEditor, judgeInfoProcessor);
