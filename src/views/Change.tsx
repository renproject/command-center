import React from "react";

interface Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    change: number | string;
}

export const Change: React.FC<Props> = ({ change, className, ...props }) => (
    <span
        {...props}
        className={[
            className,
            "change-indicator",
            typeof change === "number" && change > 0 ? "positive" :
                typeof change === "number" && change < 0 ? "negative" :
                    "neutral",
        ].join(" ")}
    >
        {change}
    </span>
);
