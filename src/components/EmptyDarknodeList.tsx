import * as React from "react";

export class EmptyDarknodeList extends React.Component {
    public render(): JSX.Element {

        const emptyCard = <div className="darknode-card">
            <div className="darknode-card--top" />
            <div className="darknode-card--middle">
                <div className="blocky" />
            </div>
        </div>;

        return (
            <div className="background--darknode-list--outer">
                <div className="darknode-list background--darknode-list">
                    {emptyCard}
                    {emptyCard}
                    {emptyCard}
                    {emptyCard}
                </div>
            </div>
        );
    }
}
