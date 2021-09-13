import { RenNetworkDetails } from "@renproject/contracts";
import { Loading } from "@renproject/react-components";
import { List, Map } from "immutable";
import React, { useEffect, useState } from "react";
import { PromiEvent, TransactionReceipt } from "web3-core";

import { ErrorCanceledByUser } from "../../../lib/ethereum/getWeb3";
import { classNames } from "../../../lib/react/className";
import {
    catchBackgroundException,
    catchInteractionException,
} from "../../../lib/react/errors";
import { NetworkContainer } from "../../../store/networkContainer";
import { PopupContainer } from "../../../store/popupContainer";
import { Web3Container } from "../../../store/web3Container";
import Warn from "../../../styles/images/warn.svg";
import { ExternalLink } from "../../../views/ExternalLink";
import { Popup } from "./Popup";
import { PopupError } from "./PopupController";

export const txUrl = (txHash: string, network: RenNetworkDetails): string => {
    return `${network.etherscan}/tx/${txHash}`;
};

interface Props {
    steps: Array<{
        name: string;
        call():
            | PromiEvent<TransactionReceipt>
            | null
            | Promise<{ promiEvent: PromiEvent<TransactionReceipt> | null }>;
        waitForConfirmation?: boolean;
    }>;

    title: string;
    confirm: boolean;
    description?: string;
    warning?: string | JSX.Element;
    ignoreWarning?: string;

    onComplete?: () => Promise<void> | void;
    onCancel?: (() => void) | (() => Promise<void>);
}

/**
 * MultiStepPopup is a popup component that prompts the user to approve a
 * series of Ethereum transactions
 */
export const MultiStepPopup: React.FC<Props> = ({
    steps,
    title,
    description,
    confirm,
    warning,
    ignoreWarning,
    onComplete,
    onCancel,
}) => {
    const { clearPopup } = PopupContainer.useContainer();
    const { waitForTX } = NetworkContainer.useContainer();
    const { renNetwork } = Web3Container.useContainer();

    const [txHashes, setTxHashes] = useState<Map<number, string | undefined>>(
        () => List(new Array(steps.length)).toMap(),
    );

    const [running, setRunning] = useState(false);
    const [complete, setComplete] = useState(false);
    const [cancelled, setCancelled] = useState(false);
    // eslint-disable-next-line prefer-const
    let [currentStep, setCurrentStep] = useState(0);
    const [runError, setRunError] = useState(null as Error | null);
    const [warningIgnored, setWarningIgnored] = useState(false);

    const notStarted = !running && !complete && !runError;

    const transactionS = steps.length === 1 ? "Transaction" : "Transaction";

    const onIgnoreWarning = (): void => {
        setWarningIgnored(true);
    };

    const callOnCancel = (): void => {
        if (onCancel) {
            const promiseOrVoid = onCancel();
            if (promiseOrVoid) {
                promiseOrVoid.catch((error) => {
                    catchBackgroundException(
                        error,
                        "Error in MultiStepPopup > onCancel",
                    );
                });
            }
        }
        clearPopup();
    };

    const onDone = () => {
        clearPopup();
    };

    const run = async () => {
        setRunError(null);
        setRunning(true);
        setCancelled(false);

        while (currentStep < steps.length) {
            const { call, waitForConfirmation } = steps[currentStep];
            try {
                // eslint-disable-next-line no-loop-func
                setTxHashes((currentTxHashes) =>
                    currentTxHashes.set(currentStep, undefined),
                );

                let callResult = call();

                // If there's no `.on` property, then await normal promise.
                if (!(callResult as PromiEvent<TransactionReceipt>).on) {
                    callResult = (
                        await (callResult as Promise<{
                            promiEvent: PromiEvent<TransactionReceipt> | null;
                        }>)
                    ).promiEvent;
                }

                if (callResult !== null) {
                    const promiEvent =
                        callResult as PromiEvent<TransactionReceipt>;
                    const txHash = await waitForTX(promiEvent);
                    // eslint-disable-next-line no-loop-func
                    setTxHashes((currentTxHashes) =>
                        currentTxHashes.set(currentStep, txHash),
                    );

                    if (
                        waitForConfirmation ||
                        currentStep === steps.length - 1
                    ) {
                        await new Promise<void>((resolve, reject) => {
                            promiEvent
                                .on("confirmation", () => resolve())
                                .catch(reject);
                        });
                    }
                }
            } catch (error) {
                const isCancelled = ((error as any).message || "").match(
                    ErrorCanceledByUser,
                );
                if (error && !isCancelled) {
                    catchInteractionException(error, {
                        description: "Error in MultiStepPopup > step.call",
                        shownToUser: "As message box in MultiStepPopup",
                    });
                }
                setRunError(error as any);
                setRunning(false);
                setCancelled(isCancelled);
                return;
            }
            currentStep += 1;
            setCurrentStep(currentStep);
        }

        setRunning(false);
        setComplete(true);

        if (onComplete) {
            const r = onComplete();
            if (r) {
                r.catch(console.error);
            }
        }
    };

    useEffect(() => {
        if (!confirm) {
            run().catch((error) => {
                catchBackgroundException(
                    error,
                    "Error in MultiStepPopup > running steps",
                );
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Show a warning to the user
    if (warning && notStarted && !warningIgnored) {
        return (
            <Popup className="multi-step" onCancel={callOnCancel}>
                <div className="multi-step--top">
                    <img
                        alt=""
                        role="presentation"
                        className="multi-step--top--warn"
                        src={Warn}
                    />
                    <h2
                        className={
                            ignoreWarning ? "multi-step--with-ignore" : ""
                        }
                    >
                        {warning}
                    </h2>
                    {ignoreWarning ? (
                        <span
                            onClick={onIgnoreWarning}
                            className="multi-step--ignore"
                            role="button"
                        >
                            {ignoreWarning}
                        </span>
                    ) : null}
                </div>
                <div className="multi-step--buttons">
                    <button
                        className="button button--white"
                        onClick={callOnCancel}
                    >
                        Cancel
                    </button>
                    {!ignoreWarning ? (
                        <button
                            className={classNames(
                                "button",
                                warning ? "button--red" : "",
                            )}
                            onClick={run}
                        >
                            Confirm
                        </button>
                    ) : null}
                </div>
            </Popup>
        );
    }

    const lastTxHash = txHashes.get(steps.length - 1);

    return (
        <Popup
            className="multi-step"
            onCancel={complete ? onDone : callOnCancel}
        >
            <div className="multi-step--top">
                <h3 className={cancelled ? "red" : ""}>
                    {cancelled
                        ? `${transactionS} cancelled`
                        : complete
                        ? `${transactionS} submitted`
                        : title}
                </h3>
                {description ? (
                    <p className="multi-step--description">{description}</p>
                ) : null}
                {!notStarted && steps.length > 1 ? (
                    <ul className="multi-step--list">
                        {steps.map((step, index) => {
                            const checked =
                                currentStep > index ||
                                (currentStep === index && !!runError);

                            const txHash = txHashes.get(index);
                            return (
                                <li key={index}>
                                    <input
                                        className={classNames(
                                            "checkbox",
                                            currentStep === index && runError
                                                ? "checkbox--error"
                                                : "",
                                        )}
                                        type="checkbox"
                                        value="None"
                                        id="slideThree"
                                        name="check"
                                        checked={checked}
                                        readOnly
                                    />
                                    <h2
                                        className={
                                            index === currentStep
                                                ? "active"
                                                : ""
                                        }
                                    >
                                        {step.name}
                                    </h2>
                                    {txHash ? (
                                        <ExternalLink
                                            style={{
                                                right: 0,
                                                position: "absolute",
                                            }}
                                            href={txUrl(txHash, renNetwork)}
                                        >
                                            View in Explorer
                                        </ExternalLink>
                                    ) : (
                                        <></>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <>
                        {lastTxHash ? (
                            <ExternalLink href={txUrl(lastTxHash, renNetwork)}>
                                View in Explorer
                            </ExternalLink>
                        ) : (
                            <></>
                        )}
                    </>
                )}

                {!cancelled && runError ? (
                    <PopupError>
                        Unable to complete transaction: {runError.message}
                    </PopupError>
                ) : null}
            </div>

            <div className="popup--buttons">
                {running ? (
                    // Show spinning icon while running through steps
                    <button className="button button--white" disabled>
                        <Loading alt={true} />
                    </button>
                ) : complete ? (
                    // Get user to click Close instead of automatically closing popup
                    <>
                        <button
                            className="button button--blue"
                            onClick={onDone}
                        >
                            Close
                        </button>
                    </>
                ) : runError ? (
                    // Let user cancel or retry after error
                    <>
                        <button
                            className="button button--white"
                            onClick={callOnCancel}
                        >
                            Cancel
                        </button>
                        <button className="button button--blue" onClick={run}>
                            Retry
                        </button>
                    </>
                ) : (
                    // Ask user to confirm
                    <>
                        <button
                            className="button button--white"
                            onClick={callOnCancel}
                        >
                            Cancel
                        </button>
                        <button
                            className={classNames(
                                "button",
                                warning ? "button--red" : "button--blue",
                            )}
                            onClick={run}
                        >
                            Confirm
                        </button>
                    </>
                )}
            </div>
        </Popup>
    );
};
