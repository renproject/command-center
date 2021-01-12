import React from "react";

import { classNames } from "../../lib/react/className";

interface Props {
    children: React.ReactNode;
    className?: string;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export const Block: React.FC<Props> = (props) => (
    <div
        role="region"
        className={classNames("block", props.className || "")}
        onClick={props.onClick}
    >
        {props.children}
    </div>
);

export const BlockBody: React.FC<Props> = (props) => (
    <div
        role="region"
        className={classNames("block--body", props.className || "")}
        onClick={props.onClick}
    >
        {props.children}
    </div>
);

export const BlockTitle: React.FC<Props> = (props) => (
    <div
        role="region"
        className={classNames("block--title", props.className || "")}
        onClick={props.onClick}
    >
        {props.children}
    </div>
);
