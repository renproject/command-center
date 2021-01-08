import BigNumber from "bignumber.js";
import { OrderedMap, List } from "immutable";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    DarknodeFeeStatus,
    RegistrationStatus,
} from "../../../lib/ethereum/contractReads";
import { TokenAmount } from "../../../lib/graphQL/queries/queries";
import { GraphContainer } from "../../../store/graphContainer";

import {
    DarknodesState,
    NetworkContainer,
} from "../../../store/networkContainer";
import { PopupContainer } from "../../../store/popupContainer";
import { UIContainer } from "../../../store/uiContainer";
import { FeesBlock, mergeFees } from "../darknodePage/blocks/FeesBlock";
import { NotClaimed } from "../darknodePage/blocks/NotClaimed";

interface Props {
    darknodeList: List<DarknodesState> | null;
}

export const WithdrawAll: React.FC<Props> = ({ darknodeList }) => {
    const {
        quoteCurrency,
        pendingRewards,
        pendingTotalInUsd,
    } = NetworkContainer.useContainer();
    const { renVM } = GraphContainer.useContainer();
    const { currentCycle, previousCycle, timeSinceLastEpoch } = renVM || {};
    const {
        claimWarningShown,
        setClaimWarningShown,
    } = UIContainer.useContainer();

    const { setPopup, clearPopup } = PopupContainer.useContainer();
    const {
        withdrawReward,
        updateDarknodeDetails,
    } = NetworkContainer.useContainer();

    const withdrawCallback = useCallback(
        async (tokenSymbol: string, tokenAddress: string) => {
            if (!darknodeList || !darknodeList.size) {
                return;
            }

            const darknodeIDs = darknodeList
                .filter((darknodeDetails) => {
                    const first = darknodeDetails.feesEarned
                        .filter(
                            (details) =>
                                details && details.symbol === tokenSymbol,
                        )
                        .first(undefined);
                    return first && !first.amount.isZero();
                })
                .map((darknodeDetails) => darknodeDetails.ID)
                .toArray();

            if (!darknodeIDs.length) {
                return;
            }

            await withdrawReward(darknodeIDs, tokenSymbol, tokenAddress);
            await Promise.all(
                darknodeIDs.map(async (darknodeID) => {
                    try {
                        await updateDarknodeDetails(darknodeID);
                    } catch (error) {
                        // Ignore error
                    }
                }),
            );
        },
        [darknodeList, updateDarknodeDetails, withdrawReward],
    );

    const [darknodeNotClaimed, setDarknodeNotClaimed] = useState<string | null>(
        null,
    );
    useEffect(() => {
        if (!claimWarningShown && darknodeNotClaimed) {
            setClaimWarningShown(true);
            setPopup({
                popup: (
                    <NotClaimed
                        darknode={darknodeNotClaimed}
                        onCancel={clearPopup}
                    />
                ),
                onCancel: clearPopup,
                dismissible: true,
                overlay: true,
            });
        }
    }, [
        darknodeNotClaimed,
        claimWarningShown,
        clearPopup,
        setPopup,
        setClaimWarningShown,
    ]);

    const withdrawable = useMemo(
        () =>
            darknodeList &&
            darknodeList.reduce(
                (acc, darknodeDetails) => ({
                    fees: mergeFees(
                        darknodeDetails.feesEarned,
                        acc.fees,
                    ).filter((fees) => fees && !fees.amount.isZero()),
                    feesInUsd: acc.feesInUsd.plus(
                        darknodeDetails.feesEarnedInUsd || new BigNumber(0),
                    ),
                }),
                {
                    fees: OrderedMap<string, TokenAmount | null>(),
                    feesInUsd: new BigNumber(0),
                },
            ),
        [darknodeList],
    );

    const pending = useMemo(
        () =>
            darknodeList &&
            darknodeList
                .map((darknodeDetails) => {
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

                    // If the darknode hasn't claimed within 1 day of a new epoch, show
                    // a warning popup.
                    const day = moment.duration(1, "day").asSeconds();
                    if (
                        showPreviousPending &&
                        timeSinceLastEpoch &&
                        timeSinceLastEpoch.gt(day)
                    ) {
                        setDarknodeNotClaimed(darknodeDetails.ID);
                    }

                    const cycleTotalInUsd = [
                        showPreviousPending ? previousCycle : null,
                        showCurrentPending ? currentCycle : null,
                    ].reduce((acc, cycle) => {
                        if (!cycle) {
                            return acc;
                        }
                        const cycleFeesInUsd = pendingTotalInUsd.get(
                            cycle,
                            null,
                        );
                        return cycleFeesInUsd
                            ? (acc || new BigNumber(0)).plus(cycleFeesInUsd)
                            : acc;
                    }, null as BigNumber | null);

                    let summedPendingRewards = OrderedMap<
                        string,
                        TokenAmount | null
                    >();
                    if (previousCycle && showPreviousPending) {
                        pendingRewards.get(previousCycle, OrderedMap());
                        // summedPendingRewards = OrderedMap();
                    }
                    if (currentCycle && showCurrentPending) {
                        summedPendingRewards = pendingRewards.get(
                            currentCycle,
                            OrderedMap(),
                        );
                    }
                    if (
                        previousCycle &&
                        currentCycle &&
                        showPreviousPending &&
                        showCurrentPending
                    ) {
                        summedPendingRewards = mergeFees(
                            pendingRewards.get(previousCycle, OrderedMap()),
                            // OrderedMap(),
                            pendingRewards.get(currentCycle, OrderedMap()),
                        );
                    }

                    return {
                        fees: summedPendingRewards,
                        feesInUsd: cycleTotalInUsd,
                    };
                })
                .reduce(
                    (acc, darknodeDetails) => ({
                        fees: mergeFees(darknodeDetails.fees, acc.fees).filter(
                            (fees) => fees && !fees.amount.isZero(),
                        ),
                        feesInUsd: acc.feesInUsd.plus(
                            darknodeDetails.feesInUsd || new BigNumber(0),
                        ),
                    }),
                    {
                        fees: OrderedMap<string, TokenAmount | null>(),
                        feesInUsd: new BigNumber(0),
                    },
                ),
        [
            currentCycle,
            darknodeList,
            pendingRewards,
            pendingTotalInUsd,
            previousCycle,
            timeSinceLastEpoch,
        ],
    );

    const earningFees: boolean = useMemo(
        () =>
            !!darknodeList &&
            darknodeList.reduce<boolean>((acc, darknodeDetails) => {
                if (acc) {
                    return acc;
                }
                return (
                    !!darknodeDetails &&
                    (darknodeDetails.registrationStatus ===
                        RegistrationStatus.Registered ||
                        darknodeDetails.registrationStatus ===
                            RegistrationStatus.DeregistrationPending)
                );
            }, false),
        [darknodeList],
    );

    if (!withdrawable || !pending) {
        return <></>;
    }

    return (
        <FeesBlock
            className="withdraw-all"
            quoteCurrency={quoteCurrency}
            isOperator={true}
            earningFees={earningFees}
            withdrawable={withdrawable.fees}
            withdrawableInUsd={withdrawable.feesInUsd}
            pending={pending.fees}
            pendingInUsd={pending.feesInUsd}
            withdrawCallback={withdrawCallback}
        />
    );

    // return (
    //     <Stats className="withdraw-al">
    //         <Stat
    //             className="network-fees-stat withdraw-all--stat"
    //             message="Withdrawable"
    //             big
    //             style={{ flexBasis: "0", flexGrow: 5 }}
    //             dark={true}
    //         >
    //             <span style={{ display: "flex" }}>
    //                 <CurrencyIcon currency={quoteCurrency} />
    //                 <ConvertCurrency
    //                     from={Currency.USD}
    //                     to={quoteCurrency}
    //                     amount={withdrawable.feesInUsd}
    //                 />
    //             </span>
    //             <div className="network-fees">
    //                 {withdrawable.fees
    //                     .filter(
    //                         (reward) =>
    //                             reward && reward.asset && reward.amount.gt(0),
    //                     )
    //                     .sortBy((reward) => reward!.amountInUsd.toNumber())
    //                     .reverse()
    //                     .map((reward, symbol) => {
    //                         return (
    //                             <div key={symbol}>
    //                                 <TokenIcon
    //                                     white={true}
    //                                     token={symbol.replace(/^ren/, "")}
    //                                 />
    //                                 <AnyTokenBalance
    //                                     amount={reward!.amount}
    //                                     decimals={reward!.asset!.decimals}
    //                                 />{" "}
    //                                 {symbol}
    //                             </div>
    //                         );
    //                     })
    //                     .valueSeq()
    //                     .toArray()}
    //             </div>
    //         </Stat>
    //         <Stat
    //             className="network-fees-stat withdraw-all--stat"
    //             message="Pending"
    //             big
    //             style={{ flexBasis: "0", flexGrow: 5 }}
    //             dark={true}
    //         >
    //             <span style={{ display: "flex" }}>
    //                 <CurrencyIcon currency={quoteCurrency} />
    //                 <ConvertCurrency
    //                     from={Currency.USD}
    //                     to={quoteCurrency}
    //                     amount={pending.feesInUsd}
    //                 />
    //             </span>
    //             <div className="network-fees">
    //                 {pending.fees
    //                     .filter(
    //                         (reward) =>
    //                             reward && reward.asset && reward.amount.gt(0),
    //                     )
    //                     .sortBy((reward) => reward!.amountInUsd.toNumber())
    //                     .reverse()
    //                     .map((reward, symbol) => {
    //                         return (
    //                             <div key={symbol}>
    //                                 <TokenIcon
    //                                     white={true}
    //                                     token={symbol.replace(/^ren/, "")}
    //                                 />
    //                                 <AnyTokenBalance
    //                                     amount={reward!.amount}
    //                                     decimals={reward!.asset!.decimals}
    //                                 />{" "}
    //                                 {symbol}
    //                             </div>
    //                         );
    //                     })
    //                     .valueSeq()
    //                     .toArray()}
    //             </div>
    //         </Stat>
    //     </Stats>
    // );
};
