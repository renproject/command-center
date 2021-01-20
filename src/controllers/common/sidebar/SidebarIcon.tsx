import { Blocky, Currency, CurrencyIcon } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import React from "react";
import { Link } from "react-router-dom";

import { darknodeIDHexToBase58 } from "../../../lib/darknode/darknodeID";
import { Token } from "../../../lib/ethereum/tokens";
import { classNames } from "../../../lib/react/className";
import { ReactComponent as FlameIcon } from "../../../styles/images/icon-flame.svg";
import { ReactComponent as RewardsIcon } from "../../../styles/images/icon-rewards-white.svg";
import { DarknodeID } from "../../../views/DarknodeID";
import { StatusDot, StatusDotColor } from "../../../views/StatusDot";
import { ConvertCurrency, TokenBalance } from "../TokenBalance";

interface Props {
    darknodeID: string;
    storedName: string | undefined;
    active: boolean;
    faded: boolean;
    feesEarnedInUsd: BigNumber | string | null | undefined;
    ethBalance: BigNumber | string | null | undefined;
    quoteCurrency: Currency;
    connected: boolean;
    hideMobileMenu: () => void;
}

/**
 * Sidebar displays stats about an operator's darknodes collectively,
 * as well as a breakdown of each darknode
 */
export const SidebarIcon: React.FC<Props> = ({
    darknodeID,
    storedName,
    active,
    faded,
    quoteCurrency,
    feesEarnedInUsd,
    ethBalance,
    connected,
    hideMobileMenu,
}) => {
    const name = storedName ? (
        storedName
    ) : (
        <DarknodeID darknodeID={darknodeID} />
    );

    const darknodeIDBase58 = darknodeIDHexToBase58(darknodeID);

    return (
        <Link
            className="no-underline"
            to={`/darknode/${darknodeIDBase58}`}
            onClick={hideMobileMenu}
        >
            <div
                className={classNames(
                    "sidebar--row",
                    active ? "sidebar--active" : "",
                    faded ? "sidebar--faded" : "",
                )}
            >
                <div className="sidebar--icon">
                    <Blocky
                        address={darknodeID}
                        fgColor="#006FE8"
                        bgColor="transparent"
                    />
                    <StatusDot
                        color={
                            connected
                                ? StatusDotColor.Green
                                : StatusDotColor.Yellow
                        }
                        size={16}
                    />
                </div>
                <div className="sidebar--text">
                    <div className="sidebar--name">{name}</div>
                    <div className="sidebar--text--details">
                        <div className="sidebar--text--rewards">
                            {feesEarnedInUsd ? (
                                <>
                                    <RewardsIcon className="sidebar--text--icon" />
                                    <span className="currency-value">
                                        <CurrencyIcon
                                            currency={quoteCurrency}
                                        />
                                        <ConvertCurrency
                                            from={Currency.USD}
                                            to={quoteCurrency}
                                            amount={
                                                new BigNumber(feesEarnedInUsd)
                                            }
                                        />
                                    </span>{" "}
                                    <span className="currency-symbol">
                                        {quoteCurrency.toUpperCase()}
                                    </span>
                                </>
                            ) : null}
                        </div>
                        <div className="sidebar--text--gas">
                            {ethBalance ? (
                                <>
                                    <FlameIcon className="sidebar--text--icon" />
                                    <span className="currency-value">
                                        <CurrencyIcon currency={Currency.ETH} />
                                        <TokenBalance
                                            token={Token.ETH}
                                            amount={ethBalance}
                                            digits={3}
                                        />
                                    </span>{" "}
                                    <span className="currency-symbol">ETH</span>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};
