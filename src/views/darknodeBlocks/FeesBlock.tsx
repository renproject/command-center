import { Currency, CurrencyIcon, Loading } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { OrderedMap } from "immutable";
import React, { useCallback, useMemo, useState } from "react";

import { ConvertCurrency } from "../../controllers/common/TokenBalance";
import { BlockState } from "../../lib/darknode/utils/blockStateUtils";
import { getDustAmountForToken } from "../../lib/darknode/utils/feesUtils";
import { TokenAmount } from "../../lib/graphQL/queries/queries";
import { classNames } from "../../lib/react/className";
import { ReactComponent as RewardsIcon } from "../../styles/images/icon-rewards-white.svg";
import { Tabs } from "../Tabs";
import { Block, BlockBody, BlockTitle } from "./Block";
import { FeesBlockRow, FeesBlockTab } from "./FeesBlockRow";

interface FeesBlockProps {
    quoteCurrency: Currency;
    isOperator: boolean;
    earningFees: boolean;
    canWithdraw: boolean;
    withdrawable: OrderedMap<string, TokenAmount | null> | null;
    pending: OrderedMap<string, TokenAmount | null> | null;
    withdrawCallback: (
        tokenSymbol: string,
        tokenAddress: string,
    ) => Promise<void>;
    isRenVMFee?: boolean;
    blockState?: BlockState;
    className?: string;
}

export const FeesBlock: React.FC<FeesBlockProps> = ({
    quoteCurrency,
    isOperator,
    earningFees,
    canWithdraw,
    withdrawable,
    pending,
    withdrawCallback,
    isRenVMFee,
    blockState,
    className,
    children,
}) => {
    const [tab, setTab] = useState(FeesBlockTab.Withdrawable);

    const onTab = useCallback(
        (newTab: string) => {
            setTab(newTab as FeesBlockTab);
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
        tab === FeesBlockTab.Withdrawable
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
            {children}
            <BlockBody>
                <Tabs
                    selected={tab}
                    tabs={
                        earningFees
                            ? isRenVMFee
                                ? {
                                      Withdrawable: null,
                                      Pending: null,
                                  }
                                : {
                                      Withdrawable: null,
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
                                            .map((balance, _token) => {
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
                                                    _i,
                                                ) => {
                                                    const dustAmount = blockState
                                                        ? getDustAmountForToken(
                                                              token,
                                                              blockState,
                                                          )
                                                        : undefined;

                                                    return (
                                                        <FeesBlockRow
                                                            key={token}
                                                            token={token}
                                                            isOperator={
                                                                isOperator
                                                            }
                                                            canWithdraw={
                                                                canWithdraw
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
                                                            isRenVMFee={
                                                                isRenVMFee
                                                            }
                                                            dustAmount={
                                                                dustAmount
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
