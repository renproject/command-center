import BigNumber from "bignumber.js";
import React from "react";

import { classNames } from "../lib/react/className";

const getIndicatorClassName = (change: number | string | BigNumber) => {
  let value = change;
  if (typeof change === "number" || typeof change === "string") {
    value = new BigNumber(change);
  }
  if (BigNumber.isBigNumber(value)) {
    return value.eq(0) ? "neutral" : value.gt(0) ? "positive" : "negative";
  }
  return "";
};

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  change: number | string | BigNumber;
}

export const Change: React.FC<Props> = ({
  change,
  className,
  defaultValue,
  children,
  ...props
}) => {
  const diractionClassName = getIndicatorClassName(change);
  const resolvedClassName = classNames(
    className,
    "change-indicator",
    diractionClassName
  );
  return (
    <span
      defaultValue={defaultValue as string[]}
      {...props}
      className={resolvedClassName}
    >
      {change}
      {children}
    </span>
  );
};
