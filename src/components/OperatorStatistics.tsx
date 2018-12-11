import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { bindActionCreators } from "redux";

import { ApplicationData, DarknodeDetails } from "@Reducers/types";
import { OrderedMap } from "immutable";
import { Link } from "react-router-dom";
import { DarknodeStatistics } from "./DarknodeStatistics";

interface StoreProps {
    darknodeDetails: OrderedMap<string, DarknodeDetails | null> | null;
}

interface OperatorStatisticsProps extends StoreProps {
    actions: {
    };
}

/**
 * OperatorStatistics displays stats about an operator's darknodes collectively,
 * as well as a breakdown of each darknode
 */
class OperatorStatisticsClass extends React.Component<OperatorStatisticsProps> {
    public constructor(props: OperatorStatisticsProps, context: object) {
        super(props, context);
    }

    public render(): JSX.Element {
        const { darknodeDetails } = this.props;

        const operationalDarknodes = darknodeDetails === null ? "-" : darknodeDetails.size.toString();

        return (
            <div className="section operatorStatistics">
                <div className="container">
                    <div className="operatorStatistics--content darknodesStatistics">
                        <div className="darknodesStatistics--column">
                            <span className="darknodesStatistics--title">Operational Darknodes</span>
                            <p className="darknodesStatistics--value">{operationalDarknodes}</p>
                        </div>

                        <div className="darknodesStatistics--column">
                            <span className="darknodesStatistics--title">Orders matched (24hrs)</span>
                            <p className="darknodesStatistics--value">-</p>
                        </div>

                        <div className="darknodesStatistics--column">
                            <span className="darknodesStatistics--title">Gas</span>
                            <p className="darknodesStatistics--value">-</p>
                        </div>

                        <div className="darknodesStatistics--column">
                            <span className="darknodesStatistics--title">Rewards Earned</span>
                            <p className="darknodesStatistics--value">-</p>
                        </div>
                    </div>
                    <div className="operatorStatistics--content darknodesList">
                        {
                            darknodeDetails === null ?
                                <span className="darknodesStatistics--title">Searching for darknodes...</span>
                                :
                                darknodeDetails.size === 0 ?
                                    <span className="darknodesStatistics--title">No darknodes. <Link to="#">How to create a new darknode.</Link></span>
                                    :
                                    <table>
                                        <thead>
                                            <th>Your darknode(s)</th>
                                            <th>Ethereum address</th>
                                            <th>Public Key</th>
                                        </thead>
                                        <tbody>
                                            {darknodeDetails && darknodeDetails.map((darknodeDetail, darknodeID) =>
                                                <DarknodeStatistics key={darknodeID} darknodeID={darknodeID} darknodeDetails={darknodeDetail} />).toArray().map((t => t[1]))}
                                        </tbody>
                                    </table>
                        }
                    </div>
                </div>
            </div>
        );
    }
}


function mapStateToProps(state: ApplicationData): StoreProps {
    return {
        darknodeDetails: state.statistics.darknodeDetails,
    };
}

function mapDispatchToProps(dispatch: Dispatch): { actions: OperatorStatisticsProps["actions"] } {
    return {
        actions: bindActionCreators({
        }, dispatch)
    };
}

export const OperatorStatistics = connect(mapStateToProps, mapDispatchToProps)(OperatorStatisticsClass);
