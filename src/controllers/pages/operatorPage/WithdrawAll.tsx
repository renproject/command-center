import { List, OrderedMap } from "immutable";
import React, { useCallback, useMemo } from "react";
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
import { FeesBlock } from "../../../views/darknodeBlocks/FeesBlock";
import { mergeFees } from "../darknodePage/blocks/FeesBlockController";

interface Props {
    darknodeList: List<DarknodesState> | null;
}

export const WithdrawAll: React.FC<Props> = ({ darknodeList }) => {
    const { quoteCurrency, pendingRewards } = NetworkContainer.useContainer();
    const { renVM, subgraphOutOfSync } = GraphContainer.useContainer();
    const { currentCycle, previousCycle } = renVM || {};
    // const {
    //     claimWarningShown,
    //     setClaimWarningShown,
    // } = UIContainer.useContainer();

    // const { setPopup, clearPopup } = PopupContainer.useContainer();
    const { withdrawReward, updateDarknodeDetails } =
        NetworkContainer.useContainer();

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

    const withdrawable = useMemo(
        () =>
            darknodeList &&
            darknodeList.reduce(
                (acc, darknodeDetails) => ({
                    fees: mergeFees(
                        darknodeDetails.feesEarned,
                        acc.fees,
                    ).filter((fees) => fees && !fees.amount.isZero()),
                }),
                {
                    fees: OrderedMap<string, TokenAmount | null>(),
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
                            DarknodeFeeStatus.NOT_CLAIMED &&
                        !subgraphOutOfSync;
                    const showCurrentPending =
                        currentCycle &&
                        darknodeDetails &&
                        darknodeDetails.cycleStatus.get(currentCycle) ===
                            DarknodeFeeStatus.NOT_CLAIMED;

                    let summedPendingRewards = OrderedMap<
                        string,
                        TokenAmount | null
                    >();
                    if (previousCycle && showPreviousPending) {
                        pendingRewards.get(
                            previousCycle,
                            OrderedMap<string, TokenAmount | null>(),
                        );
                        // summedPendingRewards = OrderedMap();
                    }
                    if (currentCycle && showCurrentPending) {
                        summedPendingRewards = pendingRewards.get(
                            currentCycle,
                            OrderedMap<string, TokenAmount | null>(),
                        );
                    }
                    if (
                        previousCycle &&
                        currentCycle &&
                        showPreviousPending &&
                        showCurrentPending
                    ) {
                        summedPendingRewards = mergeFees(
                            pendingRewards.get(
                                previousCycle,
                                OrderedMap<string, TokenAmount | null>(),
                            ),
                            // OrderedMap(),
                            pendingRewards.get(
                                currentCycle,
                                OrderedMap<string, TokenAmount | null>(),
                            ),
                        );
                    }

                    return {
                        fees: summedPendingRewards,
                    };
                })
                .reduce(
                    (acc, darknodeDetails) => ({
                        fees: mergeFees(darknodeDetails.fees, acc.fees).filter(
                            (fees) => fees && !fees.amount.isZero(),
                        ),
                    }),
                    {
                        fees: OrderedMap<string, TokenAmount | null>(),
                    },
                ),
        [
            currentCycle,
            darknodeList,
            pendingRewards,
            previousCycle,
            subgraphOutOfSync,
        ],
    );

    const anyEarningFees: boolean = useMemo(
        () =>
            !!darknodeList &&
            darknodeList.reduce<boolean>((acc, darknodeDetails) => {
                if (acc) {
                    return acc;
                }
                return (
                    !!darknodeDetails &&
                    darknodeDetails.registrationStatus ===
                        RegistrationStatus.Registered
                );
            }, false),
        [darknodeList],
    );

    const anyCanWithdraw: boolean = useMemo(
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
            earningFees={anyEarningFees}
            canWithdraw={anyCanWithdraw}
            withdrawable={withdrawable.fees}
            pending={pending.fees}
            withdrawCallback={withdrawCallback}
        />
    );
};
