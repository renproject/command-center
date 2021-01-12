import { BigNumber } from "bignumber.js";
import React, { useCallback } from "react";
import { isDefined } from "../../../../lib/general/isDefined";

import {
    DarknodesState,
    NetworkContainer,
} from "../../../../store/networkContainer";
import { Web3Container } from "../../../../store/web3Container";
import { GasBlock } from "../../../../views/darknodeBlocks/GasBlock";

interface Props {
    darknodeID: string;
    darknodeDetails: DarknodesState | null;
}

export const GasBlockController: React.FC<Props> = ({
    darknodeID,
    darknodeDetails,
}) => {
    const { address, web3, balance } = Web3Container.useContainer();
    const {
        updateDarknodeDetails,
        showFundPopup,
    } = NetworkContainer.useContainer();

    const darknodeBalance = darknodeDetails && darknodeDetails.ethBalance;

    const maxCallback = useCallback(async () => {
        if (!balance) {
            return new BigNumber(0);
        }

        // Subtract estimated gas from balance.
        const gasPrice = await web3.eth.getGasPrice();
        const gasLimit = 21000;
        const gas = new BigNumber(
            web3.utils
                .fromWei(
                    new BigNumber(gasPrice).times(gasLimit).toFixed(),
                    "ether",
                )
                .toString(),
        );
        const balanceInEth = new BigNumber(
            web3.utils.fromWei(balance.toFixed(), "ether").toString(),
        );
        return balanceInEth.minus(gas);
    }, [balance, web3]);

    const topUpCallback = useCallback(
        async (value: string) => {
            await new Promise<void>((resolve, reject) => {
                showFundPopup(darknodeID, value, reject, resolve);
            });

            try {
                await updateDarknodeDetails(darknodeID);
            } catch (error) {
                // Ignore error
            }
        },
        [darknodeID, showFundPopup, updateDarknodeDetails],
    );

    return (
        <GasBlock
            darknodeBalance={darknodeBalance}
            userBalance={balance}
            loggedIn={isDefined(address)}
            maxCallback={maxCallback}
            topUpCallBack={topUpCallback}
        />
    );
};
