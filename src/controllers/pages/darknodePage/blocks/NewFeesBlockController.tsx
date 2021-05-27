import { OrderedMap } from "immutable";
import React, { useEffect } from "react";
import { TokenAmount } from "../../../../lib/graphQL/queries/queries";
import {
    DarknodesState,
    NetworkContainer,
} from "../../../../store/networkContainer";
import { FeesBlock } from "../../../../views/darknodeBlocks/FeesBlock";

interface Props {
    isOperator: boolean;
    darknodeDetails: DarknodesState | null;
}

export const NewFeesBlockController: React.FC<Props> = ({
    isOperator,
    darknodeDetails,
}) => {
    const { blockState, quoteCurrency } = NetworkContainer.useContainer();

    const withdrawable = darknodeDetails ? darknodeDetails.feesEarned : null;
    const pending = darknodeDetails ? darknodeDetails.feesEarned : null;

    const withdraw: any = () => {};

    return (
        <FeesBlock
            quoteCurrency={quoteCurrency}
            isOperator={isOperator}
            earningFees={true}
            canWithdraw={true}
            withdrawable={withdrawable}
            pending={pending}
            withdrawCallback={withdraw}
        />
    );
};
