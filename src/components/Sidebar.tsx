import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { bindActionCreators } from "redux";

import { ApplicationData, DarknodeDetails } from "@Reducers/types";
import { OrderedMap } from "immutable";
import { Link } from "react-router-dom";
import Blocky from "./Blocky";

interface StoreProps {
    darknodeDetails: OrderedMap<string, DarknodeDetails | null> | null;
}

interface SidebarProps extends StoreProps {
    actions: {
    };
}

/**
 * Sidebar displays stats about an operator's darknodes collectively,
 * as well as a breakdown of each darknode
 */
class Sidebar extends React.Component<SidebarProps> {
    public constructor(props: SidebarProps, context: object) {
        super(props, context);
    }

    public render(): JSX.Element {
        const { darknodeDetails } = this.props;

        return (
            <div className="sidebar">
                {
                    darknodeDetails === null ?
                        <span className="sidebar--text">...</span>
                        :
                        darknodeDetails.size === 0 ?
                            <span className="sidebar--text">...</span>
                            :
                            <table>
                                <tbody>
                                    <li>O</li>
                                    <li>....</li>
                                    {darknodeDetails && darknodeDetails.map((darknodeDetail, darknodeID) => {
                                        return <li key={darknodeID}>
                                            <Blocky address={darknodeID} />
                                        </li>;
                                    }).valueSeq().toArray()}
                                </tbody>
                            </table>
                }
            </div>
        );
    }
}


function mapStateToProps(state: ApplicationData): StoreProps {
    return {
        darknodeDetails: state.statistics.darknodeDetails,
    };
}

function mapDispatchToProps(dispatch: Dispatch): { actions: SidebarProps["actions"] } {
    return {
        actions: bindActionCreators({
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
