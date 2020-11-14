import React from "react";
import { Icon, SemanticICONS } from "semantic-ui-react";

import style from "./StatusText.module.less";

import { SubmissionStatusAll } from "@/interfaces/SubmissionStatus";

const icons: Record<SubmissionStatusAll, SemanticICONS> = {
  Pending: "hourglass half",
  ConfigurationError: "code",
  SystemError: "server",
  CompilationError: "code",
  Canceled: "remove",
  FileError: "file outline",
  RuntimeError: "bomb",
  TimeLimitExceeded: "clock",
  MemoryLimitExceeded: "microchip",
  OutputLimitExceeded: "print",
  InvalidInteraction: "ban",
  PartiallyCorrect: "minus",
  WrongAnswer: "remove",
  Accepted: "checkmark",
  JudgementFailed: "server",
  Waiting: "hourglass half",
  Preparing: "spinner",
  Compiling: "spinner",
  Running: "spinner",
  Skipped: "fast forward"
};

interface StatusIconProps {
  status: string;
  noMarginRight?: boolean;
}

export const StatusIcon: React.FC<StatusIconProps> = props => (
  <span className={"statuscolor " + style[props.status]}>
    <Icon
      className={"statusicon" + " " + style.icon + (props.noMarginRight ? " " + style.noMarginRight : "")}
      loading={icons[props.status] === "spinner"}
      name={icons[props.status]}
    />
  </span>
);

interface StatusTextProps {
  // This is the text to display
  statusText?: string;
  // This is the status for icon and color, an enum value, without spaces between each work
  // If statusText is unset, this will be transformed to the text to display
  status: string;
}

const StatusText: React.FC<StatusTextProps> = props => {
  const text = props.statusText || props.status.replace(/([A-Z])/g, " $1").trimStart();
  return (
    <span className={"statuscolor " + style[props.status]}>
      <Icon
        className={"statusicon" + " " + style.icon}
        loading={icons[props.status] === "spinner"}
        name={icons[props.status]}
      />
      <span className="statustext">{text}</span>
    </span>
  );
};

export default StatusText;
