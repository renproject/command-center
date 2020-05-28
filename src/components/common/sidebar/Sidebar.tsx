import * as React from "react";

import { faExternalLinkAlt, faPlus, faThLarge, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, RouteComponentProps, withRouter } from "react-router-dom";

import { darknodeIDHexToBase58 } from "../../../lib/darknode/darknodeID";
import { RegistrationStatus } from "../../../lib/ethereum/contractReads";
import { classNames } from "../../../lib/react/className";
import { NetworkStateContainer } from "../../../store/networkStateContainer";
import { UIContainer } from "../../../store/uiStore";
import { Web3Container } from "../../../store/web3Store";
import { ReactComponent as RenVMIcon } from "../../../styles/images/Icon-HyperDrive.svg";
import { ReactComponent as IntegratorsIcon } from "../../../styles/images/icon-integrators.svg";
import { ReactComponent as NetworkIcon } from "../../../styles/images/icon-network.svg";
import { ReactComponent as OverviewIcon } from "../../../styles/images/Icon-Overview.svg";
import { ReactComponent as Search } from "../../../styles/images/search.svg";
import { ExternalLink, URLs } from "../ExternalLink";
import { SidebarIcon } from "./SidebarIcon";

const MenuItem: React.FC<{ title?: string, path?: string, icon: JSX.Element, activePath?: string, onClick: () => void, className?: string }> = ({ title, path, icon, activePath, onClick, className }) => {
    const inner = <div role="link" onClick={onClick} className={classNames("sidebar--row sidebar--nav", activePath && activePath === path ? "sidebar--active" : "", className)}>
        <div className="sidebar--nav--icon sidebar--icon">
            {icon}
        </div>
        {title ? <div className="sidebar--text">{title}</div> : <></>}
    </div>;
    return !path ? inner : <Link className={classNames("no-underline")} to={path} onClick={onClick}>
        {inner}
    </Link>;
};

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

        React.useEffect((): void => {
            if (mobileMenuActive) {
                document.documentElement.classList.add("noscroll");
            } else {
                document.documentElement.classList.remove("noscroll");
            }
        }, [mobileMenuActive]);

        return <>
            <nav className={["sidebar", address ? "sidebar--logged-in" : "", mobileMenuActive ? "sidebar--mobile--active" : ""].join(" ")}>

                <div className="sidebar--top">

                    <div className="medium-only">
                        <MenuItem icon={<FontAwesomeIcon icon={faTimes} />} onClick={hideMobileMenu} className={"sidebar--close"} />
                        <MenuItem path="/" title="Network" icon={<NetworkIcon />} activePath={location.pathname} onClick={hideMobileMenu} />
                        <MenuItem path="/integrators" title="Integrators" icon={<IntegratorsIcon />} activePath={location.pathname} onClick={hideMobileMenu} />
                        <MenuItem path="/darknode-stats" title="Darknodes" icon={<OverviewIcon />} activePath={location.pathname} onClick={hideMobileMenu} />
                        <MenuItem path="/renvm" title="RenVM" icon={<RenVMIcon />} activePath={location.pathname} onClick={hideMobileMenu} />
                        {/* <MenuItem icon={<FontAwesomeIcon icon={faTimes} />} onClick={hideMobileMenu} className={"sidebar--close"} />
                        <MenuItem path="/" title="Darknodes" icon={<FontAwesomeIcon icon={faGlobeAmericas} />} onClick={hideMobileMenu} activePath={location.pathname} />
                        <MenuItem path="/renvm" title="RenVM" icon={<RenVMIcon />} onClick={hideMobileMenu} activePath={location.pathname} /> */}
                    </div>
                    <MenuItem path="/all" title="Your Darknodes" icon={<FontAwesomeIcon icon={faThLarge} />} onClick={hideMobileMenu} activePath={location.pathname} />

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
                                    connected={details && details.nodeStatistics ? true : false}
                                    hideMobileMenu={hideMobileMenu}
                                />;
                            }).toArray() : <>
                            </>}

                        {address ? <ExternalLink href={URLs.gitbookDarknodes}><div className="sidebar--row">
                            <div className="sidebar--nav--icon sidebar--icon">
                                <div className="sidebar--nav--icon--circle sidebar--plus">
                                    <FontAwesomeIcon icon={faPlus} />
                                </div>
                            </div>
                            <div className="sidebar--text">
                                <div className="sidebar--name">Create new Darknode <FontAwesomeIcon icon={faExternalLinkAlt} className="external-link" /></div>
                            </div>
                        </div></ExternalLink> : null}
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
            {!address ? <div className="sidebar--connect xl-or-larger" onClick={handleLogin} role="button">
                <div className="wallet-icon">
                    <div className="wallet-icon--inner" />
                </div>
                <span>Connect {web3BrowserName}</span>
            </div> : <></>}
        </>;
    }
);
