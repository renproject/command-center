import * as React from "react";

import { faGlobeAmericas, faThLarge, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { Link } from "react-router-dom";
import { bindActionCreators } from "redux";

import { RegistrationStatus } from "../../lib/ethereum/network";
import { ApplicationState } from "../../store/applicationState";
import { AppDispatch } from "../../store/rootReducer";
import { hideMobileMenu } from "../../store/ui/uiActions";
import { SidebarIcon } from "./SidebarIcon";

const mapStateToProps = (state: ApplicationState) => ({
    store: {
        darknodeList: state.trader.address ? state.statistics.darknodeList.get(state.trader.address) : null,
        darknodeDetails: state.statistics.darknodeDetails,
        darknodeNames: state.statistics.darknodeNames,
        quoteCurrency: state.statistics.quoteCurrency,
        mobileMenuActive: state.ui.mobileMenuActive,
    },
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    actions: bindActionCreators({
        hideMobileMenu,
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
    selectedDarknode: string | undefined;
}
/**
 * Sidebar displays stats about an operator's darknodes collectively,
 * as well as a breakdown of each darknode
 */
export const Sidebar = connect(mapStateToProps, mapDispatchToProps)(
    ({ selectedDarknode, store, actions }: Props) => {
        const { darknodeList, darknodeDetails, darknodeNames, quoteCurrency, mobileMenuActive } = store;

        return (
            <nav className={`sidebar ${mobileMenuActive ? "sidebar--mobile--active" : ""}`}>
                <ul>
                    <div className="sidebar--nav">
                        <Link className="no-underline" to="/">
                            <li>
                                <div className="sidebar--nav--icon sidebar--icon">
                                    <FontAwesomeIcon icon={faGlobeAmericas} className="darknode-card--bottom--icon" />
                                </div>
                                <div className="sidebar--text">Overview</div>
                            </li>
                        </Link>

                        <li className="mobile-only" role="menuitem" onClick={actions.hideMobileMenu}>
                            <div className="sidebar--nav--icon sidebar--icon">
                                <FontAwesomeIcon icon={faTimes} className="darknode-card--bottom--icon" />
                            </div>
                            <div className="sidebar--text">Close</div>
                        </li>

                        <Link className="no-underline" to="/all" onClick={actions.hideMobileMenu}>
                            <li>
                                <div className="sidebar--nav--icon sidebar--icon">
                                    <FontAwesomeIcon icon={faThLarge} className="darknode-card--bottom--icon" />
                                </div>
                                <div className="sidebar--text">All Darknodes</div>
                            </li>
                        </Link>
                    </div>

                    {darknodeList && darknodeList.map((darknodeID: string) => {
                        const details = darknodeDetails.get(darknodeID);
                        return <SidebarIcon
                            key={darknodeID}
                            darknodeID={darknodeID}
                            storedName={darknodeNames.get(darknodeID)}
                            active={darknodeID === selectedDarknode}
                            faded={(details && details.registrationStatus === RegistrationStatus.Unregistered) || false}
                            feesEarnedTotalEth={details && details.feesEarnedTotalEth}
                            ethBalance={details && details.ethBalance}
                            quoteCurrency={quoteCurrency}
                            hideMobileMenu={hideMobileMenu}
                        />;
                    }).toArray()}
                </ul>
            </nav>
        );
    }
);
