import * as React from "react";

import { className } from "../../../../lib/react/className";

// tslint:disable: react-unused-props-and-state
interface Props {
    children: React.ReactNode;
    className?: string;
    onClick?: ((event: React.MouseEvent<HTMLDivElement>) => void);
}

export const Block = (props: Props) =>
    <div role="region" className={className("block", props.className || "")} onClick={props.onClick}>{props.children}</div>;

export const BlockBody = (props: Props) =>
    <div role="region" className={className("block--body", props.className || "")} onClick={props.onClick}>{props.children}</div>;

export const BlockTitle = (props: Props) =>
    <div role="region" className={className("block--title", props.className || "")} onClick={props.onClick}>{props.children}</div>;
