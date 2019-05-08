import * as React from "react";

type Props = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export const EmptyDarknodeCard: React.StatelessComponent<Props> = (props) =>
    <div {...props} className={`${props.className} darknode-card darknode-card--empty`}>
        <div className="darknode-card--top" />
        <div className="darknode-card--middle">
            <div className="blocky" />
        </div>
        {props.children}
    </div>;
