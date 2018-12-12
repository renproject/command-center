import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { bindActionCreators } from "redux";

import { deregisterDarknode } from "@Actions/trader/darknode";
import { EncodedData, Encodings } from "@Library/general/encodedData";
import { ApplicationData, DarknodeDetails } from "@Reducers/types";


interface DarknodeStatisticsProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
    darknodeID: string;
    darknodeDetails: DarknodeDetails | null;
}

interface DarknodeStatisticsState {
    active: boolean;
}

/**
 * DarknodeStatistics displays stats about an operator's darknodes collectively,
 * as well as a breakdown of each darknode
 */
class DarknodeStatisticsClass extends React.Component<DarknodeStatisticsProps, DarknodeStatisticsState> {
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
        if (!this.props.store.sdk) {
            return;
        }
        this.props.actions.deregisterDarknode(this.props.store.sdk, this.props.darknodeID);
    }
}


const mapStateToProps = (state: ApplicationData) => ({
    store: {
        sdk: state.trader.sdk,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        deregisterDarknode,
    }, dispatch),
});

export const DarknodeStatistics = connect(mapStateToProps, mapDispatchToProps)(DarknodeStatisticsClass);
