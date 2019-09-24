import * as React from "react";

import { faGlobeAmericas, faThLarge, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import { bindActionCreators } from "redux";

import { darknodeIDHexToBase58 } from "../../../lib/darknode/darknodeID";
import { RegistrationStatus } from "../../../lib/ethereum/contractReads";
import { promptLogin } from "../../../store/account/accountActions";
import { ApplicationState } from "../../../store/applicationState";
import { AppDispatch } from "../../../store/rootReducer";
import { hideMobileMenu } from "../../../store/ui/uiActions";
import { ReactComponent as HyperdriveIcon } from "../../../styles/images/Icon-HyperDrive.svg";
import { ReactComponent as Search } from "../../../styles/images/search.svg";
import { SidebarIcon } from "./SidebarIcon";

const mapStateToProps = (state: ApplicationState) => ({
    store: {
        address: state.account.address,
        darknodeList: state.account.address ? state.network.darknodeList.get(state.account.address, null) : null,
        darknodeDetails: state.network.darknodeDetails,
        darknodeNames: state.network.darknodeNames,
        quoteCurrency: state.network.quoteCurrency,
        mobileMenuActive: state.ui.mobileMenuActive,
        web3BrowserName: state.account.web3BrowserName,
        renNetwork: state.account.renNetwork,
    },
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    actions: bindActionCreators({
        hideMobileMenu,
        promptLogin,
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
        const { address, darknodeList, darknodeDetails, darknodeNames, quoteCurrency, renNetwork, mobileMenuActive, web3BrowserName } = store;

        const [searchFilter, setSearchFilter] = React.useState("");

        const handleInput = (event: React.FormEvent<HTMLInputElement>): void => {
            const element = (event.target as HTMLInputElement);
            setSearchFilter(String(element.value).toLowerCase());
        };

        const handleLogin = async () => {
            await actions.promptLogin(renNetwork, { redirect: false, showPopup: true, immediatePopup: true });
        };

        return <>
            <nav className={["sidebar", address ? "sidebar--logged-in" : "", mobileMenuActive ? "sidebar--mobile--active" : ""].join(" ")}>

                <div className="sidebar--top">

                    <div className="sidebar--row mobile-only" role="menuitem" onClick={actions.hideMobileMenu}>
                        <div className="sidebar--nav--icon sidebar--icon">
                            <FontAwesomeIcon icon={faTimes} className="darknode-card--bottom--icon" />
                        </div>
                        <div className="sidebar--text">Close</div>
                    </div>

                    <Link className="mobile-only no-underline" to="/" onClick={actions.hideMobileMenu}>
                        <div className={["sidebar--row", location.pathname === "/" ? "sidebar--active" : ""].join(" ")}>
                            <div className="sidebar--nav--icon sidebar--icon">
                                <FontAwesomeIcon icon={faGlobeAmericas} className="darknode-card--bottom--icon" />
                            </div>
                            <div className="sidebar--text">Overview</div>
                        </div>
                    </Link>

                    <Link className="mobile-only no-underline" to="/hyperdrive" onClick={actions.hideMobileMenu}>
                        <div className={["sidebar--row", location.pathname.match("/hyperdrive") ? "sidebar--active" : ""].join(" ")}>
                            <div className="sidebar--nav--icon sidebar--icon">
                                <HyperdriveIcon className="darknode-card--bottom--icon" />
                            </div>
                            <div className="sidebar--text">Hyperdrive</div>
                        </div>
                    </Link>

                    <Link className="no-underline" to="/all" onClick={actions.hideMobileMenu}>
                        <div className={["sidebar--row", location.pathname === "/all" ? "sidebar--active" : ""].join(" ")}>
                            <div className="sidebar--nav--icon sidebar--icon">
                                <FontAwesomeIcon icon={faThLarge} className="darknode-card--bottom--icon" />
                            </div>
                            <div className="sidebar--text">All Darknodes</div>
                        </div>
                    </Link>

                    <div className="search--filter--feedback">
                        {searchFilter ? <>Showing results for "{searchFilter}"</> : <>{" "}</>}
                    </div>

                    <div className="sidebar--darknodes">

                        {address && darknodeList ? darknodeList
                            .filter((darknodeID: string) => {
                                if (!searchFilter) {
                                    return true;
                                }
                                const name = (darknodeNames.get(darknodeID) || "").toLowerCase();
                                return name.indexOf(searchFilter.toLowerCase()) !== -1 ||
                                    darknodeIDHexToBase58(darknodeID).toLowerCase().indexOf(searchFilter) === 0;
                            })
                            .map((darknodeID: string) => {
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
                            }).toArray() : <>
                            </>}
                    </div>
                </div>
                <div className="sidebar--search sidebar--row">
                    <div className="sidebar--nav--icon sidebar--icon">
                        <div className="sidebar--nav--icon--circle">
                            <Search />
                        </div>
                    </div>
                    <input disabled={!address || !darknodeList} type="text" className="sidebar--search--input" onChange={handleInput} value={searchFilter} placeholder="Search" />
                </div>
            </nav>
            {!address ? <div className="sidebar--connect" onClick={handleLogin} role="button">
                <div className="wallet-icon--inner" />
                Connect {web3BrowserName}
            </div> : <></>}
        </>;
    }
));
