import { BigNumber } from "bignumber.js";
import React, { useCallback, useEffect, useState } from "react";

import { catchBackgroundException } from "../../../../lib/react/errors";
import {
    DarknodesState,
    NetworkContainer,
} from "../../../../store/networkContainer";
import { Web3Container } from "../../../../store/web3Container";
import { GasBlock } from "./GasBlock";

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

    const gasValue =
        darknodeDetails && darknodeDetails.ethBalance
            ? darknodeDetails.ethBalance
                  .div(new BigNumber(Math.pow(10, 18)))
                  .toFixed(3)
            : null;

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
            gasValue={gasValue}
            address={address}
            balance={balance}
            maxCallback={maxCallback}
            topUpCallBack={topUpCallback}
        />
    );
};
