import React from "react";

import { classNames } from "../../lib/react/className";

interface StatProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    message: React.ReactNode;
    icon?: React.ReactNode;
    big?: boolean;
    nested?: boolean;
    highlight?: boolean;
}

export const Stat = ({ icon, message, big, nested, highlight, children, className, ...props }: StatProps) =>
    <div {...props} className={["stat", highlight ? "stat--highlight" : "", nested ? "stat--nested" : "", className].join(" ")}>
        <div className="hr" />
        <h2 className="stat--title">{icon ? <span className="stat--title--icon">{icon}</span> : <></>} {message}</h2>
        <div className={["stat--children", big ? "stat--children--big" : ""].join(" ")}>{children}</div>
    </div>;

interface StatsProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> { }

export const Stats = ({ children, className, ...props }: StatsProps) => <div {...props} className={classNames("statistic--row", className)}>{children}</div>;
