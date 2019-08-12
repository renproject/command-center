import * as React from "react";

import { faGlobeAmericas, faThLarge, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import { bindActionCreators } from "redux";

import { RegistrationStatus } from "../../../lib/ethereum/contractReads";
import { ApplicationState } from "../../../store/applicationState";
import { AppDispatch } from "../../../store/rootReducer";
import { hideMobileMenu } from "../../../store/ui/uiActions";
import { ReactComponent as HyperdriveIcon } from "../../../styles/images/Icon-HyperDrive.svg";
import { SidebarIcon } from "./SidebarIcon";

const mapStateToProps = (state: ApplicationState) => ({
    store: {
        darknodeList: state.account.address ? state.network.darknodeList.get(state.account.address, null) : null,
        darknodeDetails: state.network.darknodeDetails,
        darknodeNames: state.network.darknodeNames,
        quoteCurrency: state.network.quoteCurrency,
        mobileMenuActive: state.ui.mobileMenuActive,
    },
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    actions: bindActionCreators({
        hideMobileMenu,
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps>, RouteComponentProps {
    selectedDarknode: string | undefined;
}
/**
 * Sidebar displays stats about an operator's darknodes collectively,
 * as well as a breakdown of each darknode
 */
export const Sidebar = connect(mapStateToProps, mapDispatchToProps)(withRouter(
    ({ selectedDarknode, store, actions, location }: Props) => {
        const { darknodeList, darknodeDetails, darknodeNames, quoteCurrency, mobileMenuActive } = store;

        return (
            <nav className={`sidebar ${mobileMenuActive ? "sidebar--mobile--active" : ""}`}>
                <ul>
                    <div className="sidebar--nav">

                        <li className="mobile-only" role="menuitem" onClick={actions.hideMobileMenu}>
                            <div className="sidebar--nav--icon sidebar--icon">
                                <FontAwesomeIcon icon={faTimes} className="darknode-card--bottom--icon" />
                            </div>
                            <div className="sidebar--text">Close</div>
                        </li>

                        <Link className="mobile-only no-underline" to="/" onClick={actions.hideMobileMenu}>
                            <li className={location.pathname === "/" ? "sidebar--active" : ""}>
                                <div className="sidebar--nav--icon sidebar--icon">
                                    <FontAwesomeIcon icon={faGlobeAmericas} className="darknode-card--bottom--icon" />
                                </div>
                                <div className="sidebar--text">Overview</div>
                            </li>
                        </Link>

                        <Link className="mobile-only no-underline" to="/hyperdrive" onClick={actions.hideMobileMenu}>
                            <li className={location.pathname.match("/hyperdrive") ? "sidebar--active" : ""}>
                                <div className="sidebar--nav--icon sidebar--icon">
                                    <HyperdriveIcon className="darknode-card--bottom--icon" />
                                </div>
                                <div className="sidebar--text">Hyperdrive</div>
                            </li>
                        </Link>

                        <Link className="no-underline" to="/all" onClick={actions.hideMobileMenu}>
                            <li className={location.pathname === "/all" ? "sidebar--active" : ""}>
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
));
