import React from "react";

interface StatProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    message: React.ReactNode;
    big?: boolean;
    highlight?: boolean;
}

export const Stat = ({ message, big, highlight, children, className, ...props }: StatProps) =>
    <div {...props} className={["stat", highlight ? "stat--highlight" : "", className].join(" ")}>
        <hr />
        <h2 className="stat--title">{message}</h2>
        <div className={["stat--children", big ? "stat--children--big" : ""].join(" ")}>{children}</div>
    </div>;

interface StatsProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> { }

export const Stats = ({ children }: StatsProps) => <div className="statistic--row">{children}</div>;
