import * as React from "react";

import { faStar } from "@fortawesome/free-regular-svg-icons";
import { faFire } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Blocky, Currency, CurrencyIcon } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { Link } from "react-router-dom";

import { Token } from "../../lib/ethereum/tokens";
import { DarknodeID } from "../DarknodeID";
import { darknodeIDHexToBase58 } from "../pages/Darknode";
import { TokenBalance } from "../TokenBalance";

interface Props {
    darknodeID: string;
    storedName: string | undefined;
    active: boolean;
    faded: boolean;
    feesEarnedTotalEth: BigNumber | string | undefined;
    ethBalance: BigNumber | string | undefined;
    quoteCurrency: Currency;
    hideMobileMenu: () => void;
}

/**
 * Sidebar displays stats about an operator's darknodes collectively,
 * as well as a breakdown of each darknode
 */
export const SidebarIcon = ({ darknodeID, storedName, active, faded, quoteCurrency, feesEarnedTotalEth, ethBalance, hideMobileMenu }: Props) => {
    const name = storedName ? storedName : <DarknodeID darknodeID={darknodeID} />;

    const darknodeIDBase58 = darknodeIDHexToBase58(darknodeID);

    return <Link className="no-underline" to={`/darknode/${darknodeIDBase58}`} onClick={hideMobileMenu}>
        <li className={`${active ? "sidebar--active" : ""} ${faded ? "sidebar--faded" : ""}`}>
            <div className="sidebar--icon">
                <Blocky address={darknodeID} fgColor="#006FE8" bgColor="transparent" />
            </div>
            <div className="sidebar--text">
                <div className="sidebar--name">{name}</div>
                <div className="sidebar--text--details">
                    <div className="sidebar--text--rewards">
                        {feesEarnedTotalEth ? <>
                            <FontAwesomeIcon icon={faStar} className="sidebar--text--icon" />
                            <span className="currency-value">
                                <CurrencyIcon currency={quoteCurrency} />
                                <TokenBalance
                                    token={Token.ETH}
                                    convertTo={quoteCurrency}
                                    amount={feesEarnedTotalEth}
                                />
                            </span>
                            {" "}
                            <span className="currency-symbol">
                                {quoteCurrency.toUpperCase()}
                            </span>
                        </> : null}
                    </div>
                    <div className="sidebar--text--gas">
                        {ethBalance ? <>
                            <FontAwesomeIcon icon={faFire} className="sidebar--text--icon" />
                            <span className="currency-value">
                                <CurrencyIcon currency={Currency.ETH} />
                                <TokenBalance
                                    token={Token.ETH}
                                    amount={ethBalance}
                                    digits={3}
                                />
                            </span>{" "}<span className="currency-symbol">ETH</span>
                        </> : null
                        }
                    </div>
                </div>
            </div>
        </li>
    </Link>;
};
