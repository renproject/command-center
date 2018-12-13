import * as React from "react";

import { faCircle, faThLarge } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Dispatch } from "redux";
import { bindActionCreators } from "redux";

import { ApplicationData } from "@Reducers/types";
import { Blocky } from "./Blocky";

interface SidebarProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
    selectedDarknode: string | null;
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
        const { selectedDarknode, store } = this.props;
        const { darknodeList } = store;

        return (
            <div className="sidebar">
                <ul>
                    <div className="sidebar--nav">
                        <Link to="/"><li className="sidebar--nav--icon"><FontAwesomeIcon icon={faCircle} className="darknode-card--bottom--icon" /></li></Link>
                        <Link to="/"><li className="sidebar--nav--icon"><FontAwesomeIcon icon={faThLarge} className="darknode-card--bottom--icon" /></li></Link>
                    </div>
                    {darknodeList && darknodeList.map((darknodeID) => {
                        // tslint:disable-next-line:jsx-no-lambda FIXME
                        return <Link key={darknodeID} to={`/darknode/${darknodeID}`}>
                            <li className={darknodeID === selectedDarknode ? "sidebar--active" : ""}>
                                <Blocky address={darknodeID} fgColor="#006FE8" bgColor="transparent" />
                            </li>
                        </Link>;
                    }).toArray()}
                </ul>
            </div>
        );
    }
}


const mapStateToProps = (state: ApplicationData) => ({
    store: {
        darknodeList: state.statistics.darknodeList,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
    }, dispatch),
});

export const Sidebar = connect(mapStateToProps, mapDispatchToProps)(SidebarClass);
