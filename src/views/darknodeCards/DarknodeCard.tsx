import { faStar } from "@fortawesome/free-regular-svg-icons";
import { faFire, faTimes } from "@fortawesome/free-solid-svg-icons";
import {
    FontAwesomeIcon,
    FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import { Blocky, Currency, CurrencyIcon } from "@renproject/react-components";
import React, { useCallback, useState } from "react";
import { Link } from "react-router-dom";

import BigNumber from "bignumber.js";
import {
    ConvertCurrency,
    TokenBalance,
} from "../../controllers/common/TokenBalance";
import { statusText } from "../../controllers/pages/darknodePage/RegistrationController";
import { darknodeIDHexToBase58 } from "../../lib/darknode/darknodeID";
import { RegistrationStatus } from "../../lib/ethereum/contractReads";
import { Token } from "../../lib/ethereum/tokens";
import { classNames } from "../../lib/react/className";
import { DarknodeID } from "../DarknodeID";

interface Props {
    darknodeID: string;
    name: string | undefined;
    registrationStatus: RegistrationStatus | null;
    feesEarnedInUsd: BigNumber | null;
    renVmFeesEarnedInUsd?: BigNumber;
    ethBalance: BigNumber | null;
    quoteCurrency: Currency;
    removeDarknode: () => void;

    // Optional
    continuable?: boolean;
    faded?: boolean | null;
    hidable?: boolean;
}

export const DarknodeCard: React.FC<Props> = ({
    darknodeID,
    registrationStatus,
    feesEarnedInUsd,
    renVmFeesEarnedInUsd = new BigNumber(0),
    ethBalance,
    name,
    quoteCurrency,
    faded,
    hidable,
    removeDarknode,
    continuable,
}) => {
    const [confirmedRemove, setConfirmedRemove] = useState(false);

    const handleRemoveDarknode = useCallback(
        (e: React.MouseEvent<HTMLDivElement>): void => {
            e.stopPropagation();
            e.preventDefault();

            if (!confirmedRemove) {
                setConfirmedRemove(true);
                return;
            }

            removeDarknode();
        },
        [removeDarknode, confirmedRemove],
    );

    const darknodeIDBase58 = darknodeIDHexToBase58(darknodeID);

    const url = continuable
        ? `/darknode/${darknodeIDBase58}?action=register`
        : `/darknode/${darknodeIDBase58}`;

    const totalFeesInUsd = renVmFeesEarnedInUsd.plus(feesEarnedInUsd || 0);
    return (
        <Link className="no-underline" to={url}>
            <div
                className={classNames(
                    "darknode-card",
                    faded ? "darknode-card--faded" : "",
                )}
            >
                <div className="darknode-card--top">
                    {hidable ? (
                        <div
                            role="button"
                            className="card--hide"
                            onClick={handleRemoveDarknode}
                        >
                            {confirmedRemove ? (
                                "Are you sure?"
                            ) : (
                                <FontAwesomeIcon
                                    icon={
                                        faTimes as FontAwesomeIconProps["icon"]
                                    }
                                    pull="left"
                                />
                            )}
                        </div>
                    ) : null}
                </div>
                <div className="darknode-card--middle">
                    <Blocky
                        address={darknodeID}
                        fgColor="#006FE8"
                        bgColor="transparent"
                    />

                    <h3 className="darknode-card--name">
                        {name ? name : <DarknodeID darknodeID={darknodeID} />}
                    </h3>
                    <span className="darknode-card--status">
                        {continuable
                            ? "Continue registering"
                            : registrationStatus
                            ? statusText[registrationStatus]
                            : ""}
                    </span>
                </div>
                {totalFeesInUsd && ethBalance ? (
                    <div className="darknode-card--bottom">
                        <div className="darknode-card--rewards">
                            <FontAwesomeIcon
                                icon={faStar as FontAwesomeIconProps["icon"]}
                                className="darknode-card--bottom--icon"
                            />
                            <span className="currency-value">
                                <CurrencyIcon currency={quoteCurrency} />
                                {totalFeesInUsd ? (
                                    <ConvertCurrency
                                        from={Currency.USD}
                                        to={quoteCurrency}
                                        amount={totalFeesInUsd}
                                    />
                                ) : (
                                    "..."
                                )}
                            </span>{" "}
                            <span className="currency-symbol">
                                {quoteCurrency.toUpperCase()}
                            </span>
                        </div>
                        <div className="darknode-card--gas">
                            <FontAwesomeIcon
                                icon={faFire as FontAwesomeIconProps["icon"]}
                                className="darknode-card--bottom--icon"
                            />
                            <span className="currency-value">
                                <CurrencyIcon currency={Currency.ETH} />
                                {ethBalance ? (
                                    <TokenBalance
                                        token={Token.ETH}
                                        amount={ethBalance}
                                        digits={3}
                                    />
                                ) : (
                                    <>...</>
                                )}
                            </span>{" "}
                            <span className="currency-symbol">ETH</span>
                        </div>
                    </div>
                ) : null}
            </div>
        </Link>
    );
};
