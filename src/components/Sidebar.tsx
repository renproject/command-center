import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { bindActionCreators } from "redux";

import { storeSelectedDarknode, } from "@Actions/statistics/operatorActions";
import { ApplicationData } from "@Reducers/types";
import { Blocky } from "./Blocky";

interface SidebarProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
}

/**
 * Sidebar displays stats about an operator's darknodes collectively,
 * as well as a breakdown of each darknode
 */
class SidebarClass extends React.Component<SidebarProps> {
    public constructor(props: SidebarProps, context: object) {
        super(props, context);
    }

    public render(): JSX.Element {
        const { darknodeList, selectedDarknode } = this.props.store;

        return (
            <div className="sidebar">
                {
                    darknodeList === null ?
                        <span className="sidebar--text">...</span>
                        :
                        darknodeList.size === 0 ?
                            <span className="sidebar--text">...</span>
                            :
                            <ul>
                                <li>O</li>
                                <li>....</li>
                                {darknodeList && darknodeList.map((darknodeID) => {
                                    // tslint:disable-next-line:jsx-no-lambda FIXME
                                    return <li key={darknodeID} onClick={() => this.onClick(darknodeID)} className={darknodeID === selectedDarknode ? "sidebar--active" : ""}>
                                        <Blocky address={darknodeID} fgColor="#006FE8" bgColor="transparent" />
                                    </li>;
                                }).toArray()}
                            </ul>
                }
            </div>
        );
    }

    public onClick = (darknodeID: string) => {
        this.props.actions.storeSelectedDarknode({ selectedDarknode: darknodeID });
    }
}


const mapStateToProps = (state: ApplicationData) => ({
    store: {
        darknodeList: state.statistics.darknodeList,
        selectedDarknode: state.statistics.selectedDarknode,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        storeSelectedDarknode,
    }, dispatch),
});

export const Sidebar = connect(mapStateToProps, mapDispatchToProps)(SidebarClass);
