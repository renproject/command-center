import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import {
    FontAwesomeIcon,
    FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import { Currency, CurrencyIcon, Loading } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import React, { useCallback, useState } from "react";
import {
    AnyTokenBalance,
    ConvertCurrency,
} from "../../controllers/common/TokenBalance";

import { TokenString } from "../../lib/ethereum/tokens";
import { TokenAmount } from "../../lib/graphQL/queries/queries";
import { classNames } from "../../lib/react/className";
import { TokenIcon } from "../tokenIcon/TokenIcon";

export enum FeesBlockTab {
    Withdrawable = "Withdrawable",
    Pending = "Pending",
}

interface FeesWithdrawalProps {
    disabled: boolean;
    token: TokenString;
    amount: TokenAmount | null;
    withdrawCallback: (
        tokenSymbol: string,
        tokenAddress: string,
    ) => Promise<void>;
    isRenVMFee?: boolean;
    dustAmount?: BigNumber;
}

export const FeesWithdrawal: React.FC<FeesWithdrawalProps> = ({
    token,
    amount,
    disabled,
    withdrawCallback,
    isRenVMFee = false,
    dustAmount = new BigNumber(-1),
}) => {
    const [loading, setLoading] = useState(false);

    const handleWithdraw = useCallback(async (): Promise<void> => {
        setLoading(true);

        if (
            !isRenVMFee &&
            amount &&
            amount.asset &&
            amount.asset.tokenAddress
        ) {
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
        } else if (isRenVMFee && amount && amount.asset) {
            try {
                await withdrawCallback(amount.symbol || token, "");
            } catch (error) {
                console.error(error);
                setLoading(false);
                return;
            }
        }

        setLoading(false);
    }, [token, amount, isRenVMFee, withdrawCallback]);

    // let minimumUiAmount = Math.pow(10, amount?.asset.decimals)
    let isDisabled = false;
    let title = "";
    if (disabled) {
        isDisabled = true;
        title = "Must be operator to withdraw";
    } else if (!amount || new BigNumber(amount.amount).lte(1)) {
        isDisabled = true;
        title = "No fees to withdraw";
    } else if (isRenVMFee && new BigNumber(amount.amount).lte(dustAmount)) {
        isDisabled = true;
        title = `Fee is lower than the minimum amount`;
    } else if (!isRenVMFee && (!amount.asset || !amount.asset.tokenAddress)) {
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

interface FeesBlockRowProps {
    token: TokenString;
    isOperator: boolean;
    canWithdraw: boolean;
    tab: FeesBlockTab;
    percent: number;
    balance: TokenAmount | null;
    quoteCurrency: Currency;
    withdrawCallback: (
        tokenSymbol: string,
        tokenAddress: string,
    ) => Promise<void>;
    isRenVMFee?: boolean;
    dustAmount?: BigNumber;
}

export const FeesBlockRow: React.FC<FeesBlockRowProps> = ({
    token,
    quoteCurrency,
    balance,
    isOperator,
    canWithdraw,
    tab,
    percent,
    withdrawCallback,
    isRenVMFee = false,
    dustAmount = new BigNumber(-1),
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
                            digits={balance.asset.decimals}
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
                canWithdraw ? (
                    <td>
                        <FeesWithdrawal
                            disabled={
                                tab !== FeesBlockTab.Withdrawable || !balance
                            }
                            token={token}
                            amount={balance}
                            withdrawCallback={withdrawCallback}
                            isRenVMFee={isRenVMFee}
                            dustAmount={dustAmount}
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
