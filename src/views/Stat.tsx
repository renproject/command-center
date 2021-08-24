import React from "react";

import { classNames } from "../lib/react/className";
import { InfoLabel } from "./infoLabel/InfoLabel";

interface StatProps
    extends React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLDivElement>,
        HTMLDivElement
    > {
    message?: React.ReactNode;
    icon?: React.ReactNode;
    big?: boolean;
    nested?: boolean;
    highlight?: boolean;
    dark?: boolean;
    infoLabel?: React.ReactNode;
}

export const Stat = ({
    icon,
    message,
    big,
    nested,
    highlight,
    dark,
    infoLabel,
    children,
    className,
    defaultValue,
    ...props
}: StatProps) => (
    <div
        defaultValue={defaultValue as string[]}
        {...props}
        className={classNames(
            "stat",
            highlight ? "stat--highlight" : "",
            dark ? "stat--dark" : "",
            nested ? "stat--nested" : "",
            className,
        )}
    >
        <div className="hr" />
        {message ? (
            <div className="stat--title--outer">
                <h2 className="stat--title">
                    {icon ? (
                        <span className="stat--title--icon">{icon}</span>
                    ) : null}
                    <span>{message}</span>
                </h2>
                {infoLabel ? (
                    <InfoLabel direction={"bottom"}>{infoLabel}</InfoLabel>
                ) : null}
            </div>
        ) : null}
        <div
            className={classNames(
                "stat--children",
                big ? "stat--children--big" : "",
            )}
        >
            {children}
        </div>
    </div>
);

interface StatsProps
    extends React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLDivElement>,
        HTMLDivElement
    > {}

export const Stats = ({
    children,
    className,
    defaultValue,
    ...props
}: StatsProps) => (
    <div
        defaultValue={defaultValue as string[]}
        {...props}
        className={classNames("statistic--row", className)}
    >
        {children}
    </div>
);
