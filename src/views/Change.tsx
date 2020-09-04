import React from "react";

import { classNames } from "../lib/react/className";

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  change: number | string;
}

export const Change: React.FC<Props> = ({
  change,
  className,
  defaultValue,
  ...props
}) => (
  <span
    defaultValue={defaultValue as string[]}
    {...props}
    className={classNames(
      className,
      "change-indicator",
      typeof change === "number" && change > 0
        ? "positive"
        : typeof change === "number" && change < 0
        ? "negative"
        : "neutral"
    )}
  >
    {change}
  </span>
);
