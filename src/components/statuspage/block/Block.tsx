import * as React from "react";

// tslint:disable: react-unused-props-and-state
interface Props {
    children: React.ReactNode;
    className?: string;
    onClick?: ((event: React.MouseEvent<HTMLDivElement>) => void);
}

export const Block = (props: Props) => {
    return <div role="region" className={`block ${props.className || ""}`} onClick={props.onClick}>{props.children}</div>;
};

export const BlockBody = (props: Props) => {
    return <div role="region" className={`block--body ${props.className || ""}`} onClick={props.onClick}>{props.children}</div>;
};

export const BlockTitle = (props: Props) => {
    return <div role="region" className={`block--title ${props.className || ""}`} onClick={props.onClick}>{props.children}</div>;
};
