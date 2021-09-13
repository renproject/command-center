import { List, OrderedMap } from "immutable";
import React, { useMemo } from "react";
import { RegistrationStatus } from "../../../lib/ethereum/contractReads";
import { TokenAmount } from "../../../lib/graphQL/queries/queries";

import {
    DarknodesState,
    NetworkContainer,
} from "../../../store/networkContainer";
import { FeesBlock } from "../../../views/darknodeBlocks/FeesBlock";
import { mergeFees } from "../darknodePage/blocks/FeesBlockController";

interface Props {
    darknodeList: List<DarknodesState> | null;
}

export const RenVmFeesAll: React.FC<Props> = ({ darknodeList }) => {
    const { quoteCurrency } = NetworkContainer.useContainer();

    const withdrawable = useMemo(
        () =>
            darknodeList &&
            darknodeList.reduce(
                (acc, darknodeDetails) => ({
                    fees: mergeFees(
                        darknodeDetails.renVmFeesEarned,
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
            darknodeList.reduce(
                (acc, darknodeDetails) => ({
                    fees: mergeFees(
                        darknodeDetails.renVmFeesPending,
                        acc.fees,
                    ).filter((fees) => fees && !fees.amount.isZero()),
                }),
                {
                    fees: OrderedMap<string, TokenAmount | null>(),
                },
            ),
        [darknodeList],
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

    if (!withdrawable || !pending) {
        return <></>;
    }

    const handleWithdraw: any = () => {};

    return (
        <FeesBlock
            className="withdraw-all"
            quoteCurrency={quoteCurrency}
            isOperator={true}
            earningFees={anyEarningFees}
            canWithdraw={false}
            withdrawable={withdrawable.fees}
            pending={pending.fees}
            withdrawCallback={handleWithdraw}
            isRenVMFee={true}
        />
    );
};
