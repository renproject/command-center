import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import {
    FontAwesomeIcon,
    FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import {
    Currency,
    CurrencyIcon,
    Loading,
    TokenIcon,
} from "@renproject/react-components";
import BigNumber from "bignumber.js";
import React, { useCallback, useState } from "react";
import {
    AnyTokenBalance,
    ConvertCurrency,
} from "../../controllers/common/TokenBalance";

import { TokenString } from "../../lib/ethereum/tokens";
import { TokenAmount } from "../../lib/graphQL/queries/queries";
import { classNames } from "../../lib/react/className";

export enum FeesBlockTab {
    Withdrawable = "Withdrawable",
    Pending = "Pending",
}

interface Props {
    disabled: boolean;
    token: TokenString;
    amount: TokenAmount | null;
    withdrawCallback: (
        tokenSymbol: string,
        tokenAddress: string,
    ) => Promise<void>;
}

export const FeesItem: React.FC<Props> = ({
    token,
    amount,
    disabled,
    withdrawCallback,
}) => {
    const [loading, setLoading] = useState(false);

    const handleWithdraw = useCallback(async (): Promise<void> => {
        setLoading(true);

        if (amount && amount.asset && amount.asset.tokenAddress) {
            try {
                await withdrawCallback(
                    amount.symbol || token,
                    amount.asset.tokenAddress,
                );
            } catch (error) {
                console.error(error);
                setLoading(false);
                return;
            }
        }

        setLoading(false);
    }, [token, amount, withdrawCallback]);

    let isDisabled = false;
    let title = "";
    if (disabled) {
        isDisabled = true;
        title = "Must be operator to withdraw";
    } else if (!amount || new BigNumber(amount.amount).lte(0)) {
        isDisabled = true;
        title = "No fees to withdraw";
    } else if (!amount.asset || !amount.asset.tokenAddress) {
        isDisabled = true;
        title = "Unable to look up token address";
    }

    return (
        <button
            title={title}
            className={classNames(
                "withdraw-fees",
                isDisabled ? "withdraw-fees-disabled" : "",
            )}
            disabled={isDisabled}
            onClick={isDisabled ? undefined : handleWithdraw}
        >
            {loading ? (
                <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ marginRight: 5 }}>UPDATING</span> <Loading />
                </div>
            ) : (
                <FontAwesomeIcon
                    icon={faChevronRight as FontAwesomeIconProps["icon"]}
                    pull="left"
                />
            )}
        </button>
    );
};

interface RowProps {
    token: TokenString;
    isOperator: boolean;
    earningFees: boolean;
    tab: FeesBlockTab;
    percent: number;
    balance: TokenAmount | null;
    quoteCurrency: Currency;
    withdrawCallback: (
        tokenSymbol: string,
        tokenAddress: string,
    ) => Promise<void>;
}

export const FeesBlockRow: React.FC<RowProps> = ({
    token,
    quoteCurrency,
    balance,
    isOperator,
    earningFees,
    tab,
    percent,
    withdrawCallback,
}) => {
    return (
        <>
            <tr style={{}}>
                <td className="fees-block--table--token">
                    <TokenIcon
                        className="fees-block--table--icon"
                        white={true}
                        token={token}
                    />{" "}
                    <span>{token}</span>
                </td>
                <td className="fees-block--table--value">
                    {balance && balance.asset ? (
                        <AnyTokenBalance
                            decimals={balance.asset.decimals}
                            amount={balance.amount}
                            // digits={null}
                            digits={8}
                        />
                    ) : (
                        <Loading alt={true} />
                    )}
                </td>
                <td className="fees-block--table--usd">
                    {balance ? (
                        <>
                            <CurrencyIcon currency={quoteCurrency} />
                            <ConvertCurrency
                                from={Currency.USD}
                                to={quoteCurrency}
                                amount={balance.amountInUsd}
                            />{" "}
                            <span className="fees-block--table--usd-symbol">
                                {quoteCurrency.toUpperCase()}
                            </span>
                        </>
                    ) : null}
                </td>
                {tab === FeesBlockTab.Withdrawable &&
                isOperator &&
                earningFees ? (
                    <td>
                        <FeesItem
                            disabled={
                                tab !== FeesBlockTab.Withdrawable || !balance
                            }
                            token={token}
                            amount={balance}
                            withdrawCallback={withdrawCallback}
                        />
                    </td>
                ) : null}
            </tr>
            <tr className="percent-bar--tr">
                <td colSpan={4} style={{ padding: 0, margin: 0, height: 4 }}>
                    <div
                        className={classNames("percent-bar", token)}
                        style={{
                            width: `${percent}%`,
                            height: 4,
                            marginTop: -6,
                        }}
                    />
                </td>
            </tr>
        </>
    );
};
