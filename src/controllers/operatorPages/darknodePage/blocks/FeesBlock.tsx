import { Currency, CurrencyIcon, Loading } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { OrderedMap } from "immutable";
import React, { useCallback, useMemo, useState } from "react";

import { TokenString } from "../../../../lib/ethereum/tokens";
import { TokenAmount } from "../../../../lib/graphQL/queries/queries";
import { classNames } from "../../../../lib/react/className";
import { ReactComponent as RewardsIcon } from "../../../../styles/images/icon-rewards-white.svg";
import { Tabs } from "../../../../views/Tabs";
import { TokenIcon } from "../../../../views/tokenIcon/TokenIcon";
import { AnyTokenBalance, ConvertCurrency } from "../../../common/TokenBalance";
import { FeesItem } from "../FeesItem";
import { Block, BlockBody, BlockTitle } from "./Block";

enum Tab {
    Withdrawable = "Withdrawable",
    Pending = "Pending",
}

export const mergeFees = (
    left: OrderedMap<TokenString, TokenAmount | null>,
    right: OrderedMap<TokenString, TokenAmount | null>,
) => {
    let newFees = OrderedMap<TokenString, TokenAmount | null>();

    for (const token of left
        .keySeq()
        .concat(right.keySeq())
        .toSet()
        .toArray()) {
        const leftFee = left.get(token, null);
        const rightFee = right.get(token, null);
        const newFee: TokenAmount | null =
            leftFee || rightFee
                ? {
                      symbol:
                          (leftFee && leftFee.symbol) ||
                          (rightFee && rightFee.symbol) ||
                          "",
                      asset: (leftFee && leftFee.asset) ||
                          (rightFee && rightFee.asset) || { decimals: 0 },
                      amount: new BigNumber(0)
                          .plus(leftFee ? leftFee.amount : new BigNumber(0))
                          .plus(rightFee ? rightFee.amount : new BigNumber(0)),
                      amountInEth: new BigNumber(0)
                          .plus(
                              leftFee ? leftFee.amountInEth : new BigNumber(0),
                          )
                          .plus(
                              rightFee
                                  ? rightFee.amountInEth
                                  : new BigNumber(0),
                          ),
                      amountInUsd: new BigNumber(0)
                          .plus(
                              leftFee ? leftFee.amountInUsd : new BigNumber(0),
                          )
                          .plus(
                              rightFee
                                  ? rightFee.amountInUsd
                                  : new BigNumber(0),
                          ),
                  }
                : null;
        newFees = newFees.set(token, newFee);
    }
    return newFees;
};

interface RowProps {
    token: TokenString;
    isOperator: boolean;
    earningFees: boolean;
    tab: Tab;
    percent: number;
    balance: TokenAmount | null;
    quoteCurrency: Currency;
    withdrawCallback: (
        tokenSymbol: string,
        tokenAddress: string,
    ) => Promise<void>;
}

const FeesBlockRow: React.FC<RowProps> = ({
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
                {tab === Tab.Withdrawable && isOperator && earningFees ? (
                    <td>
                        <FeesItem
                            disabled={tab !== Tab.Withdrawable || !balance}
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

export const FeesBlock: React.FC<Props> = ({
    quoteCurrency,
    isOperator,
    earningFees,
    withdrawable,
    pending,
    withdrawCallback,
    className,
}) => {
    const [tab, setTab] = useState(Tab.Withdrawable);

    const onTab = useCallback(
        (newTab: string) => {
            setTab(newTab as Tab);
        },
        [setTab],
    );

    const withdrawableInUsd = useMemo(
        () =>
            withdrawable
                ? withdrawable
                      .map((fee) => (fee ? fee.amountInUsd : new BigNumber(0)))
                      .reduce((acc, fee) => acc.plus(fee), new BigNumber(0))
                : null,
        [withdrawable],
    );

    const pendingInUsd = useMemo(
        () =>
            pending
                ? pending
                      .map((fee) => (fee ? fee.amountInUsd : new BigNumber(0)))
                      .reduce((acc, fee) => acc.plus(fee), new BigNumber(0))
                : null,
        [pending],
    );

    const [fees, tabTotalInUsd] =
        tab === Tab.Withdrawable
            ? [withdrawable, withdrawableInUsd]
            : [pending, pendingInUsd];

    return (
        <Block className={classNames("fees-block", className)}>
            <BlockTitle>
                <h3>
                    <RewardsIcon />
                    Darknode Income
                </h3>
            </BlockTitle>

            <BlockBody>
                <Tabs
                    selected={tab}
                    tabs={
                        earningFees
                            ? {
                                  Withdrawable: null,
                                  Pending: null,
                              }
                            : {
                                  Withdrawable: null,
                              }
                    }
                    onTab={onTab}
                >
                    {fees ? (
                        <div className="block--advanced">
                            <div className="block--advanced--top">
                                <div className="fees-block--total">
                                    <span className="fees-block--advanced--sign">
                                        <CurrencyIcon
                                            currency={quoteCurrency}
                                        />
                                    </span>
                                    <span className="fees-block--advanced--value">
                                        {tabTotalInUsd ? (
                                            <ConvertCurrency
                                                from={Currency.USD}
                                                to={quoteCurrency}
                                                amount={tabTotalInUsd}
                                            />
                                        ) : (
                                            <Loading />
                                        )}
                                    </span>
                                    <span className="fees-block--advanced--unit">
                                        {quoteCurrency.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <div className="block--advanced--bottom">
                                <table className="fees-block--table">
                                    <thead>
                                        <tr>
                                            <td>Asset</td>
                                            <td>Amount</td>
                                            <td
                                                style={{
                                                    textAlign: "right",
                                                    paddingRight: 40,
                                                }}
                                            >
                                                Value
                                            </td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fees
                                            .map((balance, token) => {
                                                return {
                                                    balance,
                                                    percent:
                                                        balance && tabTotalInUsd
                                                            ? balance.amountInUsd
                                                                  .div(
                                                                      tabTotalInUsd,
                                                                  )
                                                                  .times(100)
                                                                  .decimalPlaces(
                                                                      2,
                                                                  )
                                                                  .toNumber() ||
                                                              0
                                                            : 0,
                                                };
                                            })
                                            .sortBy((item) =>
                                                item.balance?.amountInUsd.toNumber(),
                                            )
                                            .reverse()
                                            .toArray()
                                            .map(
                                                (
                                                    [
                                                        token,
                                                        { balance, percent },
                                                    ],
                                                    i,
                                                ) => {
                                                    return (
                                                        <FeesBlockRow
                                                            key={token}
                                                            token={token}
                                                            isOperator={
                                                                isOperator
                                                            }
                                                            earningFees={
                                                                earningFees
                                                            }
                                                            withdrawCallback={
                                                                withdrawCallback
                                                            }
                                                            tab={tab}
                                                            percent={percent}
                                                            balance={balance}
                                                            quoteCurrency={
                                                                quoteCurrency
                                                            }
                                                        />
                                                    );
                                                },
                                            )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : null}
                </Tabs>
            </BlockBody>
        </Block>
    );
};

interface Props {
    quoteCurrency: Currency;
    isOperator: boolean;
    earningFees: boolean;
    withdrawable: OrderedMap<string, TokenAmount | null> | null;
    pending: OrderedMap<string, TokenAmount | null> | null;
    withdrawCallback: (
        tokenSymbol: string,
        tokenAddress: string,
    ) => Promise<void>;
    className?: string;
}
