import { Loading } from "@renproject/react-components";
import React, { useEffect, useMemo, useState } from "react";

import { DarknodeAction } from "../controllers/pages/darknodePage/DarknodePage";
import { RegistrationStatus } from "../lib/ethereum/contractReads";
import { classNames } from "../lib/react/className";
import { StatusDot, StatusDotColor } from "../views/StatusDot";

const statusText = {
    [RegistrationStatus.Unknown]: "Loading...",
    [RegistrationStatus.Unregistered]: "Deregistered",
    [RegistrationStatus.RegistrationPending]: "Registration pending",
    [RegistrationStatus.Registered]: "Registered",
    [RegistrationStatus.DeregistrationPending]: "Deregistration pending",
    [RegistrationStatus.Deregistered]: "Awaiting Refund Period",
    [RegistrationStatus.Refundable]: "Refundable",
};

interface Props {
    address: string | null;
    operator: string | null;
    registrationStatus: RegistrationStatus;
    web3BrowserName: string;
    action: DarknodeAction;
    loginCallback: () => Promise<void>;
    registerCallback?: () => Promise<void>;
    deregisterCallback?: () => Promise<void>;
    refundCallback?: () => Promise<void>;
}

export const Registration: React.FC<Props> = ({
    address,
    registrationStatus,
    operator,
    web3BrowserName,
    action,
    loginCallback,
    registerCallback,
    deregisterCallback,
    refundCallback,
}) => {
    const [initialRegistrationStatus] = useState(registrationStatus);
    const [active, setActive] = useState(false);

    useEffect(() => {
        if (registrationStatus !== initialRegistrationStatus) {
            setActive(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [registrationStatus]);

    const onDone = () => setActive(false);

    const login = async () => {
        // If the user is not logged in, prompt login. On mobile, it may not be
        // obvious to the user that they need to login.
        if (!address) {
            await loginCallback();
        }
    };

    const handleRegister = async (): Promise<void> => {
        if (!address || !registerCallback) {
            return; // TODO: Show error.
        }

        setActive(true);
        await registerCallback().finally(onDone);
    };

    const handleDeregister = async (): Promise<void> => {
        if (!address || !deregisterCallback) {
            return;
        }

        setActive(true);
        await deregisterCallback().finally(onDone);
    };

    const handleRefund = async (): Promise<void> => {
        if (!address || !refundCallback) {
            return;
        }

        setActive(true);
        await refundCallback().finally(onDone);
    };

    const disabled = active || !address;

    const noOperator = registrationStatus === RegistrationStatus.Unregistered;

    const isOperator = useMemo(
        () =>
            (action === DarknodeAction.Register && noOperator) ||
            (address &&
                operator &&
                address.toLowerCase() === operator.toLowerCase()),
        [address, operator, action, noOperator],
    );

    const noStatus =
        registrationStatus === RegistrationStatus.Unregistered ||
        (isOperator && registrationStatus === RegistrationStatus.Refundable);

    return (
        <div className="status">
            {!noStatus ? (
                <span
                    className={classNames(
                        "status--title",
                        registrationStatus === RegistrationStatus.Registered
                            ? "status--registered"
                            : "",
                    )}
                >
                    <StatusDot
                        color={
                            registrationStatus === RegistrationStatus.Registered
                                ? StatusDotColor.Green
                                : StatusDotColor.Yellow
                        }
                        size={16}
                    />
                    {statusText[registrationStatus]}
                </span>
            ) : null}
            {isOperator ? (
                <>
                    {registrationStatus === RegistrationStatus.Unregistered ? (
                        !address ? (
                            <button
                                className="status--button status--button--blue"
                                onClick={login}
                            >
                                {active ? (
                                    <>
                                        Registering{" "}
                                        <Loading
                                            className="status--button--spinner"
                                            alt
                                        />
                                    </>
                                ) : (
                                    <>Connect {web3BrowserName}</>
                                )}
                            </button>
                        ) : (
                            <button
                                disabled={disabled || !registerCallback}
                                className="status--button status--button--blue"
                                onClick={handleRegister}
                            >
                                {active ? (
                                    <>
                                        Registering{" "}
                                        <Loading
                                            className="status--button--spinner"
                                            alt
                                        />
                                    </>
                                ) : (
                                    `Register darknode`
                                )}
                            </button>
                        )
                    ) : null}
                    {registrationStatus === RegistrationStatus.Registered ? (
                        <button
                            disabled={disabled || !deregisterCallback}
                            className="status--button"
                            onClick={handleDeregister}
                        >
                            {active ? (
                                <>
                                    Deregistering{" "}
                                    <Loading
                                        className="status--button--spinner"
                                        alt
                                    />
                                </>
                            ) : (
                                "Deregister"
                            )}
                        </button>
                    ) : null}
                    {registrationStatus === RegistrationStatus.Refundable ? (
                        <button
                            disabled={disabled || !refundCallback}
                            className="status--button status--button--blue"
                            onClick={handleRefund}
                        >
                            {active ? (
                                <>
                                    Refunding{" "}
                                    <Loading
                                        className="status--button--spinner"
                                        alt
                                    />
                                </>
                            ) : (
                                "Refund"
                            )}
                        </button>
                    ) : null}
                </>
            ) : noOperator ? (
                <span className="status--title">NOT REGISTERED</span>
            ) : operator ? (
                <span className="status--operator">
                    Operator: <span className="monospace">{operator}</span>
                </span>
            ) : null}
        </div>
    );
};
