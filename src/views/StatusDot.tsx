import React from "react";

import { classNames } from "../lib/react/className";

export enum StatusDotColor {
    Red = "red",
    Yellow = "yellow",
    Green = "green",
    Blue = "blue",
}

interface Props
    extends React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLSpanElement>,
        HTMLSpanElement
    > {
    color: StatusDotColor;
    size: number;
}

export const StatusDot: React.FC<Props> = ({
    color,
    size,
    style,
    className,
    ...props
}) => (
    <span
        style={{
            width: size,
            height: size,
            minWidth: size,
            minHeight: size,
            ...style,
        }}
        className={classNames(className, "status-dot", `status-dot--${color}`)}
        {...props}
    >
        <span />
    </span>
);
