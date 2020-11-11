import { Loading } from "@renproject/react-components";
import React, { useEffect, useState } from "react";

import { ErrorCanceledByUser } from "../../../lib/ethereum/getWeb3";
import { classNames } from "../../../lib/react/className";
import {
    catchBackgroundException,
    catchInteractionException,
} from "../../../lib/react/errors";
import { PopupContainer } from "../../../store/popupContainer";
import Warn from "../../../styles/images/warn.svg";
import { PopupError } from "./PopupController";

/**
 * MultiStepPopup is a popup component that prompts the user to approve a
 * series of Ethereum transactions
 */
const MultiStepPopupClass: React.FC<Props> = ({
    steps,
    title,
    confirm,
    warning,
    ignoreWarning,
    onCancel,
}) => {
    const { clearPopup } = PopupContainer.useContainer();

    const [running, setRunning] = useState(false);
    const [complete, setComplete] = useState(false);
    const [rejected, setRejected] = useState(false);
    // tslint:disable-next-line: prefer-const
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
        setRejected(false);

        while (currentStep < steps.length) {
            try {
                await steps[currentStep].call();
            } catch (error) {
                const isRejected = (error.message || "").match(
                    ErrorCanceledByUser,
                );
                if (error && !isRejected) {
                    catchInteractionException(error, {
                        description: "Error in MultiStepPopup > step.call",
                        shownToUser: "As message box in MultiStepPopup",
                    });
                }
                setRunError(error);
                setRunning(false);
                setRejected(isRejected);
                return;
            }
            currentStep += 1;
            setCurrentStep(currentStep);
        }

        setRunning(false);
        setComplete(true);
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
            <div className="popup multi-step">
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
            </div>
        );
    }

    return (
        <div className="popup multi-step">
            <div className="multi-step--top">
                <h3 className={rejected ? "red" : ""}>
                    {rejected
                        ? `${transactionS} rejected`
                        : complete
                        ? `${transactionS} submitted`
                        : title}
                </h3>
                {!notStarted && steps.length > 1 ? (
                    <ul className="multi-step--list">
                        {steps.map(
                            (
                                step: { name: string; call(): Promise<void> },
                                index: number,
                            ) => {
                                const checked =
                                    currentStep > index ||
                                    (currentStep === index && !!runError);
                                return (
                                    <li key={index}>
                                        <input
                                            className={classNames(
                                                "checkbox",
                                                currentStep === index &&
                                                    runError
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
                                    </li>
                                );
                            },
                        )}
                    </ul>
                ) : null}

                {!rejected && runError ? (
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
        </div>
    );
};

interface Props {
    steps: Array<{
        name: string;
        call(): Promise<void>;
    }>;

    title: string;
    confirm: boolean;
    warning?: string | JSX.Element;
    ignoreWarning?: string;

    onCancel?: (() => void) | (() => Promise<void>);
}

export const MultiStepPopup = MultiStepPopupClass;
