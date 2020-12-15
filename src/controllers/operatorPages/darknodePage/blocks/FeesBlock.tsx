import { Currency, CurrencyIcon, Loading } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { OrderedMap } from "immutable";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
    DarknodeFeeStatus,
    RegistrationStatus,
} from "../../../../lib/ethereum/contractReads";
import { TokenString } from "../../../../lib/ethereum/tokens";
import { TokenAmount } from "../../../../lib/graphQL/queries/queries";
import { classNames } from "../../../../lib/react/className";
import { GraphContainer } from "../../../../store/graphContainer";
import {
    DarknodesState,
    NetworkContainer,
} from "../../../../store/networkContainer";
import { ReactComponent as RewardsIcon } from "../../../../styles/images/icon-rewards-white.svg";
// import { ReactComponent as WithdrawIcon } from "../../../../styles/images/icon-withdraw.svg";
import { Tabs } from "../../../../views/Tabs";
import { TokenIcon } from "../../../../views/tokenIcon/TokenIcon";
import { AnyTokenBalance, ConvertCurrency } from "../../../common/TokenBalance";
import { FeesItem } from "../FeesItem";
import { Block, BlockBody, BlockTitle } from "./Block";

enum Tab {
    Withdrawable = "Withdrawable",
    Pending = "Pending",
}

const mergeFees = (
    left: OrderedMap<TokenString, TokenAmount | null>,
    right: OrderedMap<TokenString, TokenAmount | null>,
) => {
    let newFees = OrderedMap<TokenString, TokenAmount | null>();

    for (const token of left.keySeq().concat(right.keySeq()).toArray()) {
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
    darknodeDetails: DarknodesState;
    tab: Tab;
    percent: number;
    balance: TokenAmount | null;
    quoteCurrency: Currency;
}

const FeesBlockRow: React.FC<RowProps> = ({
    token,
    quoteCurrency,
    balance,
    isOperator,
    tab,
    percent,
    darknodeDetails,
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
                {tab === Tab.Withdrawable &&
                isOperator &&
                (darknodeDetails.registrationStatus ===
                    RegistrationStatus.Registered ||
                    darknodeDetails.registrationStatus ===
                        RegistrationStatus.DeregistrationPending) ? (
                    <td>
                        <FeesItem
                            disabled={tab !== Tab.Withdrawable || !balance}
                            token={token}
                            amount={balance}
                            darknodeID={darknodeDetails.ID}
                        />
                    </td>
                ) : null}
            </tr>
            <tr>
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

export const FeesBlock: React.FC<Props> = ({ darknodeDetails, isOperator }) => {
    const {
        quoteCurrency,
        pendingRewards,
        pendingTotalInUsd,
    } = NetworkContainer.useContainer();
    const { renVM } = GraphContainer.useContainer();
    const { currentCycle, previousCycle } = renVM || {};

    const [tab, setTab] = useState(Tab.Withdrawable);
    const [disableClaim, setDisableClaim] = useState(false);

    const [currentCycleStatus, setCurrentCycleStatus] = useState<string | null>(
        null,
    );

    const cycleStatus: string | null = useMemo(
        () => darknodeDetails && darknodeDetails.cycleStatus.keySeq().first(),
        [darknodeDetails],
    );

    useEffect(() => {
        setCurrentCycleStatus(cycleStatus);
        if (disableClaim && cycleStatus !== currentCycleStatus) {
            setDisableClaim(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cycleStatus]);

    const showPreviousPending =
        previousCycle &&
        darknodeDetails &&
        darknodeDetails.cycleStatus.get(previousCycle) ===
            DarknodeFeeStatus.NOT_CLAIMED;
    const showCurrentPending =
        currentCycle &&
        darknodeDetails &&
        darknodeDetails.cycleStatus.get(currentCycle) ===
            DarknodeFeeStatus.NOT_CLAIMED;

    const cycleTotalInUsd = [
        showPreviousPending ? previousCycle : null,
        showCurrentPending ? currentCycle : null,
    ].reduce((acc, cycle) => {
        if (!cycle) {
            return acc;
        }
        const cycleFeesInUsd = pendingTotalInUsd.get(cycle, null);
        return cycleFeesInUsd
            ? (acc || new BigNumber(0)).plus(cycleFeesInUsd)
            : acc;
    }, null as BigNumber | null);

    let summedPendingRewards = OrderedMap<string, TokenAmount | null>();
    if (previousCycle && showPreviousPending) {
        // TODO(noah)
        summedPendingRewards = OrderedMap(); // pendingRewards.get(previousCycle, OrderedMap());
    }
    if (currentCycle && showCurrentPending) {
        summedPendingRewards = pendingRewards.get(currentCycle, OrderedMap());
    }
    if (
        previousCycle &&
        currentCycle &&
        showPreviousPending &&
        showCurrentPending
    ) {
        summedPendingRewards = mergeFees(
            // TODO(noah)
            // pendingRewards.get(previousCycle, OrderedMap()),
            OrderedMap(),
            pendingRewards.get(currentCycle, OrderedMap()),
        );
    }

    let fees = OrderedMap<TokenString, TokenAmount | null>();
    if (darknodeDetails) {
        fees =
            tab === Tab.Withdrawable
                ? darknodeDetails.feesEarned
                : tab === Tab.Pending
                ? summedPendingRewards
                : OrderedMap();
    }

    const onTab = useCallback(
        (newTab: string) => {
            setTab(newTab as Tab);
        },
        [setTab],
    );

    const tabTotalInUsd = darknodeDetails
        ? tab === Tab.Withdrawable
            ? darknodeDetails.feesEarnedInUsd
            : cycleTotalInUsd
        : null;

    return (
        <Block className="fees-block">
            <BlockTitle>
                <h3>
                    <RewardsIcon />
                    Darknode Income
                </h3>
            </BlockTitle>

            {darknodeDetails ? (
                <BlockBody>
                    <Tabs
                        selected={tab}
                        tabs={
                            darknodeDetails.registrationStatus ===
                                RegistrationStatus.Registered ||
                            darknodeDetails.registrationStatus ===
                                RegistrationStatus.DeregistrationPending
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
                                {/* <button className="button button--dark"><WithdrawIcon className="icon" />Withdraw</button> */}
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
                                                            darknodeDetails={
                                                                darknodeDetails
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
                    </Tabs>
                </BlockBody>
            ) : null}
        </Block>
    );
};

interface Props {
    isOperator: boolean;
    darknodeDetails: DarknodesState | null;
}
