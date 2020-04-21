import * as React from "react";

import { Loading } from "@renproject/react-components";

import { NULL, RegistrationStatus } from "../../../lib/ethereum/contractReads";
import { catchInteractionException } from "../../../lib/react/errors";
import { DarknodesState, NetworkStateContainer } from "../../../store/networkStateContainer";
import { Web3Container } from "../../../store/web3Store";

export const statusText = {
    [RegistrationStatus.Unknown]: "Loading...",
    [RegistrationStatus.Unregistered]: "Deregistered",
    [RegistrationStatus.RegistrationPending]: "Registration pending",
    [RegistrationStatus.Registered]: "Registered",
    [RegistrationStatus.DeregistrationPending]: "Deregistration pending",
    [RegistrationStatus.Deregistered]: "Awaiting Refund Period",
    [RegistrationStatus.Refundable]: "Refundable",
};

interface Props {
    isOperator: boolean;
    registrationStatus: RegistrationStatus;
    darknodeID: string;
    darknodeDetails: DarknodesState | null;
    publicKey?: string;
}

export const Registration: React.StatelessComponent<Props> = ({ darknodeID, darknodeDetails, registrationStatus, isOperator, publicKey }) => {
    const { address, renNetwork } = Web3Container.useContainer();
    const { tokenPrices, unhideDarknode, updateDarknodeDetails, updateOperatorDarknodes, showRegisterPopup, showDeregisterPopup, showRefundPopup } = NetworkStateContainer.useContainer();

    const [initialRegistrationStatus,] = React.useState(registrationStatus);
    const [active, setActive] = React.useState(false);

    React.useEffect(() => {
        if (registrationStatus !== initialRegistrationStatus) {
            setActive(false);
        }
    }, [registrationStatus]);

    const onCancel = () => {
        setActive(false);
    };

    const onDone = async () => {
        try {
            await updateDarknodeDetails(darknodeID);
        } catch (error) {
            // Ignore error
        }

        setActive(false);
    };

    const onDoneRegister = async () => {
        if (!address) {
            return; // FIXME
        }

        try {
            await updateOperatorDarknodes();
        } catch (error) {
            // Ignore error
        }

        setActive(false);
    };

    const handleRegister = async (): Promise<void> => {
        if (!publicKey || !address || !tokenPrices) {
            return; // FIXME
        }

        setActive(true);
        try {
            await showRegisterPopup(
                darknodeID, publicKey, onCancel, onDoneRegister,
            );
            unhideDarknode(darknodeID, address, renNetwork.name);
        } catch (error) {
            catchInteractionException(error, "Error in Registration > handleRegister > showRegisterPopup");
            onCancel();
        }
    };

    const handleDeregister = async (): Promise<void> => {
        if (!address) {
            return;
        }

        setActive(true);
        showDeregisterPopup(
            darknodeID,
            darknodeDetails && darknodeDetails.feesEarnedTotalEth,
            onCancel,
            onDone,
        );
    };

    const handleRefund = async (): Promise<void> => {
        if (!address) {
            return;
        }

        setActive(true);
        showRefundPopup(darknodeID, onCancel, onDone);
    };

    const disabled = active || !address;
    const registrationDisabled = disabled || !publicKey || !tokenPrices;

    const noStatus =
        (registrationStatus === RegistrationStatus.Unregistered) ||
        (isOperator && registrationStatus === RegistrationStatus.Refundable);

    const noOperator = (registrationStatus === RegistrationStatus.Unregistered) && darknodeDetails &&
        darknodeDetails.operator === NULL;

    return (
        <div className="status">
            {!noStatus ?
                <span className="status--title">{statusText[registrationStatus]}</span> : null}
            {isOperator ? <>
                {registrationStatus === RegistrationStatus.Unregistered ?
                    <button disabled={registrationDisabled} className="status--button" onClick={handleRegister}>
                        {active ? <>Registering <Loading className="status--button--spinner" alt /></> : `Register darknode${registrationDisabled && !publicKey ? " (public key required)" : ""}`}
                    </button> :
                    null
                }
                {registrationStatus === RegistrationStatus.Registered ?
                    <button disabled={disabled} className="status--button" onClick={handleDeregister}>
                        {active ? <>Deregistering <Loading className="status--button--spinner" alt /></> : "Deregister"}
                    </button> :
                    null
                }
                {registrationStatus === RegistrationStatus.Refundable
                    ? <button
                        disabled={disabled}
                        className="status--button status--button--focus"
                        onClick={handleRefund}
                    >
                        {active ? <>Refunding <Loading className="status--button--spinner" alt /></> : "Refund"}
                    </button> :
                    null
                }
            </> : noOperator ?
                    <span className="status--operator">NOT REGISTERED</span> :
                    (darknodeDetails ?
                        <span className="status--operator">
                            Operator: <span className="monospace">{darknodeDetails.operator}</span>
                        </span> :
                        null
                    )
            }
        </div>
    );
};
