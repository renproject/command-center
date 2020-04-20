import * as React from "react";

import {
    faExternalLinkAlt, faGlobeAmericas, faPlus, faThLarge, faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, RouteComponentProps, withRouter } from "react-router-dom";

import { darknodeIDHexToBase58 } from "../../../lib/darknode/darknodeID";
import { RegistrationStatus } from "../../../lib/ethereum/contractReads";
import { NetworkStateContainer } from "../../../store/networkStateContainer";
import { UIContainer } from "../../../store/uiStore";
import { Web3Container } from "../../../store/web3Store";
import { ReactComponent as RenVMIcon } from "../../../styles/images/Icon-HyperDrive.svg";
import { ReactComponent as Search } from "../../../styles/images/search.svg";
import { SidebarIcon } from "./SidebarIcon";

interface Props extends RouteComponentProps {
    selectedDarknode: string | undefined;
}
/**
 * Sidebar displays stats about an operator's darknodes collectively,
 * as well as a breakdown of each darknode
 */
export const Sidebar = withRouter(
    ({ selectedDarknode, location }: Props) => {

        const { darknodeDetails, darknodeNames, quoteCurrency } = NetworkStateContainer.useContainer();
        const { address, web3BrowserName, promptLogin } = Web3Container.useContainer();
        const { mobileMenuActive, hideMobileMenu } = UIContainer.useContainer();

        const { darknodeList, hiddenDarknodes } = NetworkStateContainer.useContainer();
        const accountDarknodeList = React.useMemo(() => address ? darknodeList.get(address, null) : null, [darknodeList]);
        const accountHiddenDarknodes = React.useMemo(() => address ? hiddenDarknodes.get(address, null) : null, [hiddenDarknodes]);

        const shownDarknodeList = !accountDarknodeList ? accountDarknodeList : accountDarknodeList.filter(d => !accountHiddenDarknodes || !accountHiddenDarknodes.contains(d));

        const [searchFilter, setSearchFilter] = React.useState("");

        const handleInput = (event: React.FormEvent<HTMLInputElement>): void => {
            const element = (event.target as HTMLInputElement);
            setSearchFilter(String(element.value).toLowerCase());
        };

        const handleLogin = async () => {
            await promptLogin({ manual: true, redirect: false, showPopup: true, immediatePopup: true });
        };

        return <>
            <nav className={["sidebar", address ? "sidebar--logged-in" : "", mobileMenuActive ? "sidebar--mobile--active" : ""].join(" ")}>

                <div className="sidebar--top">

                    <div className="sidebar--row mobile-only" role="menuitem" onClick={hideMobileMenu}>
                        <div className="sidebar--nav--icon sidebar--icon">
                            <FontAwesomeIcon icon={faTimes} className="darknode-card--bottom--icon" />
                        </div>
                        <div className="sidebar--text">Close</div>
                    </div>

                    <Link className="mobile-only no-underline" to="/" onClick={hideMobileMenu}>
                        <div className={["sidebar--row", location.pathname === "/" ? "sidebar--active" : ""].join(" ")}>
                            <div className="sidebar--nav--icon sidebar--icon">
                                <FontAwesomeIcon icon={faGlobeAmericas} className="darknode-card--bottom--icon" />
                            </div>
                            <div className="sidebar--text">Darknodes</div>
                        </div>
                    </Link>

                    <Link className="mobile-only no-underline" to="/renvm" onClick={hideMobileMenu}>
                        <div className={["sidebar--row", location.pathname.match("/(renvm|hyperdrive)") ? "sidebar--active" : ""].join(" ")}>
                            <div className="sidebar--nav--icon sidebar--icon">
                                <RenVMIcon className="darknode-card--bottom--icon" />
                            </div>
                            <div className="sidebar--text">RenVM</div>
                        </div>
                    </Link>

                    <Link className="no-underline" to="/all" onClick={hideMobileMenu}>
                        <div className={["sidebar--row", location.pathname === "/all" ? "sidebar--active" : ""].join(" ")}>
                            <div className="sidebar--nav--icon sidebar--icon">
                                <FontAwesomeIcon icon={faThLarge} className="darknode-card--bottom--icon" />
                            </div>
                            <div className="sidebar--text">Your Darknodes</div>
                        </div>
                    </Link>

                    <div className="search--filter--feedback">
                        {searchFilter ? <>Showing results for "{searchFilter}"</> : <>{" "}</>}
                    </div>

                    <div className="sidebar--darknodes">
                        {address && shownDarknodeList ? shownDarknodeList
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

                        {address ? <a target="_blank" rel="noopener noreferrer" href="https://docs.renproject.io/darknodes/"><div className="sidebar--row">
                            <div className="sidebar--nav--icon sidebar--icon">
                                <div className="sidebar--nav--icon--circle sidebar--plus">
                                    <FontAwesomeIcon icon={faPlus} className="darknode-card--bottom--icon" />
                                </div>
                            </div>
                            <div className="sidebar--text">
                                <div className="sidebar--name">Create new Darknode <FontAwesomeIcon icon={faExternalLinkAlt} className="external-link" /></div>
                            </div>
                        </div></a> : null}
                    </div>
                </div>
                <div className="sidebar--search sidebar--row">
                    <div className="sidebar--nav--icon sidebar--icon">
                        <div className="sidebar--nav--icon--circle">
                            <Search />
                        </div>
                    </div>
                    <input disabled={!address || !shownDarknodeList} type="text" className="sidebar--search--input" onChange={handleInput} value={searchFilter} placeholder="Search" />
                </div>
            </nav>
            {!address ? <div className="sidebar--connect" onClick={handleLogin} role="button">
                <div className="wallet-icon--inner" />
                Connect {web3BrowserName}
            </div> : <></>}
        </>;
    }
);
