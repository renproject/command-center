import React, { FC } from "react";

import { classNames } from "../lib/react/className";

export enum StatusDotColor {
    Red = "red",
    Yellow = "yellow",
    Green = "green",
}

export const StatusDot: FC<{ color: StatusDotColor, size: number }> = ({ color, size }) => (
    <span
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
        className={classNames("status-dot", `status-dot--${color}`)}
    >
        <span />
    </span>
);
