import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { bindActionCreators } from "redux";

import { deregisterDarknode, DeregisterDarknodeAction } from "@Actions/trader/darknode";
import { EncodedData, Encodings } from "@Library/general/encodedData";
import { ApplicationData, DarknodeDetails } from "@Reducers/types";
import RenExSDK from "renex-sdk-ts";

interface StoreProps {
    sdk: RenExSDK;
}

interface DarknodeStatisticsProps extends StoreProps {
    darknodeID: string;
    darknodeDetails: DarknodeDetails | null;

    actions: {
        deregisterDarknode: DeregisterDarknodeAction;
    };
}

interface DarknodeStatisticsState {
    active: boolean;
}

/**
 * DarknodeStatistics displays stats about an operator's darknodes collectively,
 * as well as a breakdown of each darknode
 */
class DarknodeStatistics extends React.Component<DarknodeStatisticsProps, DarknodeStatisticsState> {
    public constructor(props: DarknodeStatisticsProps, context: object) {
        super(props, context);
        this.state = {
            active: false,
        };
    }

    public render(): JSX.Element {
        const { darknodeID, darknodeDetails } = this.props;
        const { active } = this.state;

        const darknodeID58 = new EncodedData("0x1b14" + darknodeID.slice(2), Encodings.HEX).toBase58();


        return (
            <>
                <tr className="darknodeStatistics">
                    <td><div className="darknodeStatistics--name">{darknodeID58} <button onClick={this.handleClickView} className="darknodesList--view">View</button></div></td>
                    <td>{darknodeID.substring(0, 8)}...{darknodeID.slice(-5)}</td>
                    <td>{darknodeID.substring(0, 8)}...{darknodeID.slice(-5)}</td>
                </tr>
                <tr className={`${active ? "" : "hidden"} darknodeStatistics--hidden`}>
                    <td colSpan={3}>
                        <div className="darknodeStatistics--controls">
                            <button onClick={this.handleDeregister}>Deregister</button>
                            <button>Refund</button>
                        </div>
                        <div className="darknodeStatistics--details">
                            <div className="darknodeStatistics--details--column">
                                <span className="darknodeStatistics--details--title">Operational balance</span>
                                <p className="darknodeStatistics--details--value">-</p>
                            </div>
                            <div className="darknodeStatistics--details--column">
                                <span className="darknodeStatistics--details--title">Average gas used</span>
                                <p className="darknodeStatistics--details--value">-</p>
                            </div>
                            <div className="darknodeStatistics--details--column">
                                <span className="darknodeStatistics--details--title">Rewards Earned</span>
                                <p className="darknodeStatistics--details--value">-</p>
                            </div>
                            <div className="darknodeStatistics--details--column">
                                <span className="darknodeStatistics--details--title">Withdraw</span>
                                <p className="darknodeStatistics--details--value">-</p>
                            </div>
                        </div>
                    </td>
                </tr>
            </>
        );
    }

    private handleClickView = () => {
        this.setState({ active: !this.state.active });
    }

    private handleDeregister = () => {
        this.props.actions.deregisterDarknode(this.props.sdk, this.props.darknodeID);
    }
}


function mapStateToProps(state: ApplicationData): StoreProps {
    return {
        sdk: state.trader.sdk,
    };
}

function mapDispatchToProps(dispatch: Dispatch): { actions: DarknodeStatisticsProps["actions"] } {
    return {
        actions: bindActionCreators({
            deregisterDarknode,
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DarknodeStatistics);
