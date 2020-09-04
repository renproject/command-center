import { Loading } from "@renproject/react-components";
import React, { useEffect, useState } from "react";

import { NULL, RegistrationStatus } from "../../../lib/ethereum/contractReads";
import { classNames } from "../../../lib/react/className";
import { catchInteractionException } from "../../../lib/react/errors";
import { GraphContainer } from "../../../store/graphContainer";
import { DarknodesState, NetworkContainer } from "../../../store/networkContainer";
import { Web3Container } from "../../../store/web3Container";
import { StatusDot, StatusDotColor } from "../../../views/StatusDot";

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

export const Registration: React.FC<Props> = ({ darknodeID, darknodeDetails, registrationStatus, isOperator, publicKey }) => {
    const { address, promptLogin, web3BrowserName } = Web3Container.useContainer();
    const { renVM } = GraphContainer.useContainer();
    const { tokenPrices, unhideDarknode, updateDarknodeDetails, updateOperatorDarknodes, showRegisterPopup, showDeregisterPopup, showRefundPopup } = NetworkContainer.useContainer();

    const [initialRegistrationStatus,] = useState(registrationStatus);
    const [active, setActive] = useState(false);

    useEffect(() => {
        if (registrationStatus !== initialRegistrationStatus) {
            setActive(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [registrationStatus]);

    const onCancel = () => setActive(false);

    const onDone = async () => {
        await updateDarknodeDetails(darknodeID).catch(/* ignore error */);
        setActive(false);
    };

    const onDoneRegister = async () => {
        await updateOperatorDarknodes().catch(/* ignore error */);

        setActive(false);
    };

    const login = async () => {
        // If the user is not logged in, prompt login. On mobile, it may not be
        // obvious to the user that they need to login.
        if (!address) {
            await promptLogin({ manual: true });
        }
    };

    const handleRegister = async (): Promise<void> => {
        if (!publicKey) {
            return; // TODO: Show error.
        }

        if (!address) {
            return; // TODO: Show error.
        }

        setActive(true);
        try {
            await showRegisterPopup(
                address, darknodeID, publicKey, onCancel, onDoneRegister,
            );
            unhideDarknode(darknodeID, address);
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
    const registrationDisabled = active || !publicKey || !tokenPrices || !renVM;

    const noStatus =
        (registrationStatus === RegistrationStatus.Unregistered) ||
        (isOperator && registrationStatus === RegistrationStatus.Refundable);

    const noOperator = (registrationStatus === RegistrationStatus.Unregistered) && darknodeDetails &&
        darknodeDetails.operator === NULL;

    return (
        <div className="status">
            {!noStatus ?
                <span className={classNames("status--title", registrationStatus === RegistrationStatus.Registered ? "status--registered" : "")}>
                    <StatusDot color={registrationStatus === RegistrationStatus.Registered ? StatusDotColor.Green : StatusDotColor.Yellow} size={16} />
                    {statusText[registrationStatus]}
                </span> : null}
            {isOperator ? <>
                {registrationStatus === RegistrationStatus.Unregistered ?
                    !address ?
                    <button disabled={registrationDisabled} className="status--button" onClick={login}>
                    {active ? <>Registering <Loading className="status--button--spinner" alt /></> : <>Connect {web3BrowserName}</>}
                </button> :
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
