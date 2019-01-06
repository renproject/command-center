import * as React from "react";

interface Props {
    children: React.ReactNode;
    className?: string;
    onClick?: ((event: React.MouseEvent<HTMLDivElement>) => void);
}

export const Block = (props: Props) => {
    return <div className={`block ${props.className || ""}`} onClick={props.onClick}>{props.children}</div>;
};

export const BlockBody = (props: Props) => {
    return <div className={`block--body ${props.className || ""}`} onClick={props.onClick}>{props.children}</div>;
};

export const BlockTitle = (props: Props) => {
    return <div className={`block--title ${props.className || ""}`} onClick={props.onClick}>{props.children}</div>;
};
