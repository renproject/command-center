import React, { useCallback } from "react";

import { RegistrationStatus } from "../../../lib/ethereum/contractReads";
import {
    DarknodesState,
    NetworkContainer,
} from "../../../store/networkContainer";
import { Web3Container } from "../../../store/web3Container";
import { DarknodeCard } from "../../../views/darknodeCards/DarknodeCard";

interface Props {
    darknodeID: string;
    darknodeDetails: DarknodesState | null;
    name: string | undefined;
    registering: boolean | undefined;
}

export const DarknodeCardController: React.FC<Props> = ({
    darknodeID,
    darknodeDetails,
    name,
    registering,
}) => {
    const { address } = Web3Container.useContainer();
    const {
        quoteCurrency,
        hideDarknode,
        removeRegisteringDarknode,
    } = NetworkContainer.useContainer();

    // If we have the public key and the status is unregistered (or the status is not available yet), then link to
    // the registration page
    const continuable =
        (registering &&
            (!darknodeDetails ||
                darknodeDetails.registrationStatus ===
                    RegistrationStatus.Unregistered)) ||
        false;

    const handleRemoveDarknode = useCallback((): void => {
        if (continuable) {
            removeRegisteringDarknode(darknodeID);
        } else if (address) {
            hideDarknode(darknodeID, address);
        }
    }, [
        continuable,
        removeRegisteringDarknode,
        address,
        darknodeID,
        hideDarknode,
    ]);

    const faded =
        darknodeDetails &&
        darknodeDetails.registrationStatus ===
            RegistrationStatus.Unregistered &&
        !continuable;

    const hidable =
        (darknodeDetails &&
            darknodeDetails.registrationStatus ===
                RegistrationStatus.Unregistered) ||
        continuable;

    return (
        <DarknodeCard
            darknodeID={darknodeID}
            registrationStatus={
                darknodeDetails && darknodeDetails.registrationStatus
            }
            feesEarnedInUsd={darknodeDetails && darknodeDetails.feesEarnedInUsd}
            ethBalance={darknodeDetails && darknodeDetails.ethBalance}
            name={name}
            quoteCurrency={quoteCurrency}
            faded={faded}
            hidable={hidable}
            removeDarknode={handleRemoveDarknode}
            continuable={continuable}
        />
    );
};
