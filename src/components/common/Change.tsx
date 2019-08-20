import React from "react";

interface Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    change: number;
}

export const Change = ({ change, className, ...props }: Props) => {
    return <span {...props} className={[className, "change-indicator", change > 0 ? "positive" : change < 0 ? "negative" : "neutral"].join(" ")}>
        {change}
    </span>;
};
