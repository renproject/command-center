import {
    faExternalLinkAlt,
    faPlus,
    faThLarge,
    faTimes,
} from "@fortawesome/free-solid-svg-icons";
import {
    FontAwesomeIcon,
    FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { darknodeIDHexToBase58 } from "../../../lib/darknode/darknodeID";
import { RegistrationStatus } from "../../../lib/ethereum/contractReads";
import { classNames } from "../../../lib/react/className";
import { NetworkContainer } from "../../../store/networkContainer";
import { UIContainer } from "../../../store/uiContainer";
import { Web3Container } from "../../../store/web3Container";
import { ReactComponent as RenVMIcon } from "../../../styles/images/Icon-HyperDrive.svg";
import { ReactComponent as IntegratorsIcon } from "../../../styles/images/icon-integrators.svg";
import { ReactComponent as NetworkIcon } from "../../../styles/images/icon-network.svg";
import { ReactComponent as OverviewIcon } from "../../../styles/images/Icon-Overview.svg";
import { ReactComponent as Search } from "../../../styles/images/search.svg";
import { ExternalLink, URLs } from "../../../views/ExternalLink";
import { HighlightAllDarknodes } from "./HighlightAllDarknodes";
import { SidebarIcon } from "./SidebarIcon";

const MenuItem: React.FC<{
    title?: string;
    path?: string;
    icon: JSX.Element;
    activePath?: string;
    onClick: () => void;
    className?: string;
}> = ({ title, path, icon, activePath, onClick, className }) => {
    const inner = (
        <div
            role="link"
            onClick={onClick}
            className={classNames(
                "sidebar--row sidebar--nav",
                activePath && activePath === path ? "sidebar--active" : "",
                className,
            )}
        >
            <div className="sidebar--nav--icon sidebar--icon">
                {title === "Your Darknodes" ? <HighlightAllDarknodes /> : null}
                {icon}
            </div>
            {title ? <div className="sidebar--text">{title}</div> : null}
        </div>
    );
    return !path ? (
        inner
    ) : (
        <Link
            className={classNames("no-underline")}
            to={path}
            onClick={onClick}
        >
            {inner}
        </Link>
    );
};

/**
 * Sidebar displays stats about an operator's darknodes collectively,
 * as well as a breakdown of each darknode
 */
export const Sidebar = () => {
    const location = useLocation();

    const {
        darknodeDetails,
        darknodeNames,
        quoteCurrency,
        darknodeList,
        hiddenDarknodes,
    } = NetworkContainer.useContainer();
    const {
        address,
        web3BrowserName,
        promptLogin,
    } = Web3Container.useContainer();
    const { mobileMenuActive, hideMobileMenu } = UIContainer.useContainer();
    const { selectedDarknodeID } = UIContainer.useContainer();

    const accountDarknodeList = useMemo(
        () => (address ? darknodeList.get(address, null) : null),
        [darknodeList, address],
    );
    const accountHiddenDarknodes = useMemo(
        () => (address ? hiddenDarknodes.get(address, null) : null),
        [hiddenDarknodes, address],
    );

    const shownDarknodeList = !accountDarknodeList
        ? accountDarknodeList
        : accountDarknodeList.filter(
              (d) =>
                  !accountHiddenDarknodes ||
                  !accountHiddenDarknodes.contains(d),
          );

    const [searchFilter, setSearchFilter] = useState("");

    const handleInput = (event: React.FormEvent<HTMLInputElement>): void => {
        const element = event.target as HTMLInputElement;
        setSearchFilter(String(element.value).toLowerCase());
    };

    const handleLogin = async () => {
        await promptLogin({ manual: true });
    };

    useEffect((): void => {
        if (mobileMenuActive) {
            document.documentElement.classList.add("noscroll");
        } else {
            document.documentElement.classList.remove("noscroll");
        }
    }, [mobileMenuActive]);

    return (
        <>
            <nav
                className={classNames(
                    "sidebar",
                    address ? "sidebar--logged-in" : "",
                    mobileMenuActive ? "sidebar--mobile--active" : "",
                )}
            >
                <div className="sidebar--top">
                    <div className="medium-only">
                        <MenuItem
                            icon={
                                <FontAwesomeIcon
                                    icon={
                                        faTimes as FontAwesomeIconProps["icon"]
                                    }
                                />
                            }
                            onClick={hideMobileMenu}
                            className={"sidebar--close"}
                        />
                        <MenuItem
                            path="/"
                            title="Network"
                            icon={<NetworkIcon />}
                            activePath={location.pathname}
                            onClick={hideMobileMenu}
                        />
                        <MenuItem
                            path="/integrators"
                            title="Integrators"
                            icon={<IntegratorsIcon />}
                            activePath={location.pathname}
                            onClick={hideMobileMenu}
                        />
                        <MenuItem
                            path="/darknodes"
                            title="Darknodes"
                            icon={<OverviewIcon />}
                            activePath={location.pathname}
                            onClick={hideMobileMenu}
                        />
                        <MenuItem
                            path="/renvm"
                            title="RenVM"
                            icon={<RenVMIcon />}
                            activePath={location.pathname}
                            onClick={hideMobileMenu}
                        />
                        {/* <MenuItem icon={<FontAwesomeIcon icon={faTimes as FontAwesomeIconProps["icon"]} />} onClick={hideMobileMenu} className={"sidebar--close"} />
                        <MenuItem path="/" title="Darknodes" icon={<FontAwesomeIcon icon={faGlobeAmericas as FontAwesomeIconProps["icon"]} />} onClick={hideMobileMenu} activePath={location.pathname} />
                        <MenuItem path="/renvm" title="RenVM" icon={<RenVMIcon />} onClick={hideMobileMenu} activePath={location.pathname} /> */}
                    </div>
                    <MenuItem
                        path="/all"
                        title="Your Darknodes"
                        icon={
                            <FontAwesomeIcon
                                icon={faThLarge as FontAwesomeIconProps["icon"]}
                            />
                        }
                        onClick={hideMobileMenu}
                        activePath={location.pathname}
                    />

                    <div className="search--filter--feedback">
                        {searchFilter ? (
                            <>Showing results for "{searchFilter}"</>
                        ) : (
                            <> </>
                        )}
                    </div>

                    <div className="sidebar--darknodes">
                        {address && shownDarknodeList ? (
                            shownDarknodeList
                                .filter((darknodeID: string) => {
                                    if (!searchFilter) {
                                        return true;
                                    }
                                    const name = (
                                        darknodeNames.get(darknodeID) || ""
                                    ).toLowerCase();
                                    return (
                                        name.indexOf(
                                            searchFilter.toLowerCase(),
                                        ) !== -1 ||
                                        darknodeIDHexToBase58(darknodeID)
                                            .toLowerCase()
                                            .indexOf(searchFilter) === 0
                                    );
                                })
                                .map((darknodeID: string) => {
                                    const details = darknodeDetails.get(
                                        darknodeID,
                                    );
                                    return (
                                        <SidebarIcon
                                            key={darknodeID}
                                            darknodeID={darknodeID}
                                            storedName={darknodeNames.get(
                                                darknodeID,
                                            )}
                                            active={
                                                darknodeID ===
                                                selectedDarknodeID
                                            }
                                            faded={
                                                (details &&
                                                    details.registrationStatus ===
                                                        RegistrationStatus.Unregistered) ||
                                                false
                                            }
                                            feesEarnedInUsd={
                                                details &&
                                                details.feesEarnedInUsd
                                            }
                                            renVmFeesEarnedInUsd={
                                                details?.renVmFeesEarnedInUsd ||
                                                undefined
                                            }
                                            ethBalance={
                                                details && details.ethBalance
                                            }
                                            quoteCurrency={quoteCurrency}
                                            connected={
                                                details?.registrationStatus ===
                                                RegistrationStatus.Registered
                                            }
                                            hideMobileMenu={hideMobileMenu}
                                        />
                                    );
                                })
                                .toArray()
                        ) : (
                            <></>
                        )}

                        {address ? (
                            <ExternalLink href={URLs.gitbookDarknodes}>
                                <div className="sidebar--row">
                                    <div className="sidebar--nav--icon sidebar--icon">
                                        <div className="sidebar--nav--icon--circle sidebar--plus">
                                            <FontAwesomeIcon
                                                icon={
                                                    faPlus as FontAwesomeIconProps["icon"]
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="sidebar--text">
                                        <div className="sidebar--name">
                                            Create new Darknode{" "}
                                            <FontAwesomeIcon
                                                icon={
                                                    faExternalLinkAlt as FontAwesomeIconProps["icon"]
                                                }
                                                className="external-link"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </ExternalLink>
                        ) : null}
                    </div>
                </div>
                <div className="sidebar--search sidebar--row">
                    <div className="sidebar--nav--icon sidebar--icon">
                        <div className="sidebar--nav--icon--circle">
                            <Search />
                        </div>
                    </div>
                    <input
                        disabled={!address || !shownDarknodeList}
                        type="text"
                        className="sidebar--search--input"
                        onChange={handleInput}
                        value={searchFilter}
                        placeholder="Search"
                    />
                </div>
            </nav>
            {!address ? (
                <div
                    className="sidebar--connect xl-or-larger"
                    onClick={handleLogin}
                    role="button"
                >
                    <div className="wallet-icon">
                        <div className="wallet-icon--inner" />
                    </div>
                    <span>Connect {web3BrowserName}</span>
                </div>
            ) : null}
        </>
    );
};
