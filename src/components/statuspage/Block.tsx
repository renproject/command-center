import * as React from "react";

interface Props { children: React.ReactNode; className?: string; }

export const Block = (props: Props) => {
    return <div className={`block ${props.className || ""}`}>{props.children}</div>;
};

export const BlockBody = (props: Props) => {
    return <div className={`block--body ${props.className || ""}`}>{props.children}</div>;
};

export const BlockTitle = (props: Props) => {
    return <div className={`block--title ${props.className || ""}`}>{props.children}</div>;
};
