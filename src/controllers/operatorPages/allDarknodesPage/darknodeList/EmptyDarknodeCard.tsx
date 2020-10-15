import React from "react";

import { classNames } from "../../../../lib/react/className";

type Props = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

export const EmptyDarknodeCard: React.FC<Props> = ({
  defaultValue,
  ...props
}) => (
  <div
    defaultValue={defaultValue as string[]}
    {...props}
    className={classNames(
      props.className,
      "darknode-card",
      "darknode-card--empty"
    )}
  >
    <div className="darknode-card--top" />
    <div className="darknode-card--middle">
      <div className="blocky" />
    </div>
    {props.children}
  </div>
);
