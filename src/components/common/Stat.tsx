import React from "react";

import { classNames } from "../../lib/react/className";
import { InfoLabel } from "./infoLabel/InfoLabel";

interface StatProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    message: React.ReactNode;
    icon?: React.ReactNode;
    big?: boolean;
    nested?: boolean;
    highlight?: boolean;
    infoLabel?: React.ReactNode;
}

export const Stat = ({ icon, message, big, nested, highlight, infoLabel, children, className, ...props }: StatProps) =>
    <div {...props} className={["stat", highlight ? "stat--highlight" : "", nested ? "stat--nested" : "", className].join(" ")}>
        <div className="hr" />
        <div className="stat--title--outer"><h2 className="stat--title">{icon ? <span className="stat--title--icon">{icon}</span> : <></>} {message}</h2>{infoLabel ? <InfoLabel>{infoLabel}</InfoLabel> : null}</div>
        <div className={["stat--children", big ? "stat--children--big" : ""].join(" ")}>{children}</div>
    </div>;

interface StatsProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> { }

export const Stats = ({ children, className, ...props }: StatsProps) => <div {...props} className={classNames("statistic--row", className)}>{children}</div>;
