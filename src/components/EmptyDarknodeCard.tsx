import * as React from "react";

export const EmptyDarknodeCard = (props: { className?: string }) => {
    return <div className={`darknode-card darknode-card--empty ${props.className}`}>
        <div className="darknode-card--top" />
        <div className="darknode-card--middle">
            <div className="blocky" />
        </div>
    </div>;
};
