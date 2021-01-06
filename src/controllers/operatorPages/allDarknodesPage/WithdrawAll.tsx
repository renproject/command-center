import BigNumber from "bignumber.js";
import { OrderedMap, OrderedSet } from "immutable";
import React, { useCallback } from "react";
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
import { FeesBlock, mergeFees } from "../darknodePage/blocks/FeesBlock";

interface Props {
    darknodeList: OrderedSet<DarknodesState> | null;
}

export const WithdrawAll: React.FC<Props> = ({ darknodeList }) => {
    const {
        quoteCurrency,
        pendingRewards,
        pendingTotalInUsd,
    } = NetworkContainer.useContainer();
    const { renVM } = GraphContainer.useContainer();
    const { currentCycle, previousCycle } = renVM || {};

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

    if (!darknodeList) {
        return <></>;
    }

    const withdrawable = darknodeList.reduce(
        (acc, darknodeDetails) => ({
            fees: mergeFees(darknodeDetails.feesEarned, acc.fees).filter(
                (fees) => fees && !fees.amount.isZero(),
            ),
            feesInUsd: acc.feesInUsd.plus(
                darknodeDetails.feesEarnedInUsd || new BigNumber(0),
            ),
        }),
        {
            fees: OrderedMap<string, TokenAmount | null>(),
            feesInUsd: new BigNumber(0),
        },
    );

    const pending = darknodeList
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
        );

    const earningFees: boolean = darknodeList.reduce<boolean>(
        (acc, darknodeDetails) => {
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
        },
        false,
    );

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
