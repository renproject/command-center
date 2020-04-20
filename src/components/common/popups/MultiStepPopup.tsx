import * as React from "react";

import { Loading } from "@renproject/react-components";

import { ErrorCanceledByUser } from "../../../lib/ethereum/getWeb3";
import { classNames } from "../../../lib/react/className";
import { _catchBackgroundException_, _catchInteractionException_ } from "../../../lib/react/errors";
import { PopupContainer } from "../../../store/popupStore";
import Warn from "../../../styles/images/warn.svg";

/**
 * MultiStepPopup is a popup component that prompts the user to approve a
 * series of Ethereum transactions
 */
const MultiStepPopupClass: React.StatelessComponent<Props> = ({ steps,
    title,
    confirm,
    warning,
    ignoreWarning,
    onCancel,
}) => {

    const { clearPopup } = PopupContainer.useContainer();

    const [running, setRunning] = React.useState(false);
    const [complete, setComplete] = React.useState(false);
    const [rejected, setRejected] = React.useState(false);
    // tslint:disable-next-line: prefer-const
    let [currentStep, setCurrentStep] = React.useState(0);
    const [runError, setRunError] = React.useState(null as Error | null);
    const [warningIgnored, setWarningIgnored] = React.useState(false);

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
                    _catchBackgroundException_(error, "Error in MultiStepPopup > onCancel");
                });
            }
        }
        clearPopup();
    };

    const onDone = () => {
        // const { onDone } = this.props;
        // if (onDone) {
        //     const promiseOrVoid = onDone();
        //     if (promiseOrVoid) {
        //         promiseOrVoid.catch(console.error);
        //     }
        // }
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
                const isRejected = (error.message || "").match(ErrorCanceledByUser);
                if (!isRejected) {
                    _catchInteractionException_(error, {
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


    React.useEffect(() => {
        if (!confirm) {
            run()
                .catch((error) => {
                    _catchBackgroundException_(error, "Error in MultiStepPopup > running steps");
                });
        }
    }, []);

    // Show a warning to the user
    if (warning && notStarted && !warningIgnored) {
        return <div className="popup multi-step">
            <div className="multi-step--top">
                <img alt="" role="presentation" src={Warn} />
                <h2 className={ignoreWarning ? "multi-step--with-ignore" : ""}>{warning}</h2>
                {ignoreWarning ?
                    <span
                        onClick={onIgnoreWarning}
                        className="multi-step--ignore"
                        role="button"
                    >
                        {ignoreWarning}
                    </span> :
                    null
                }
            </div>
            <div className="multi-step--buttons" >
                <button className="button button--white" onClick={callOnCancel}>Cancel</button>
                {!ignoreWarning ?
                    <button className={classNames("button", warning ? "button--red" : "")} onClick={run}>
                        Confirm
                        </button> :
                    null
                }
            </div>
        </div>;
    }

    return <div className="popup multi-step">
        <div className="multi-step--top">
            <h2 className={rejected ? "red" : ""}>
                {rejected ? `${transactionS} rejected` : complete ? `${transactionS} submitted` : title}
            </h2>
            {!notStarted && steps.length > 1 ? <ul className="multi-step--list">
                {
                    steps.map((
                        step: { name: string; call(): Promise<void> },
                        index: number,
                    ) => {
                        const checked = (currentStep > index) || (currentStep === index && !!runError);
                        return <li key={index}>
                            <input
                                className={classNames("checkbox", currentStep === index && runError ? "checkbox--error" : "")}
                                type="checkbox"
                                value="None"
                                id="slideThree"
                                name="check"
                                checked={checked}
                                readOnly
                            />
                            <span className={index === currentStep ? "active" : ""}>
                                Step {index + 1}: {step.name}
                            </span>
                        </li>;
                    })
                }
            </ul> : null}

            {!rejected && runError ?
                <p className="popup--error red">Unable to complete transaction: {runError.message}</p> :
                null
            }

        </div>

        <div className="multi-step--buttons" >
            {running ?
                // Show spinning icon while running through steps
                <button className="button button--white" disabled><Loading /></button> :
                complete ?
                    // Get user to click Close instead of automatically closing popup
                    <>
                        <button className="button" onClick={onDone}>
                            Close
                            </button>
                    </> :
                    runError ?
                        // Let user cancel or retry after error
                        <>
                            <button className="button button--white" onClick={callOnCancel}>
                                Cancel
                                </button>
                            <button className="button button--white" onClick={run}>
                                Retry
                                </button>
                        </> :
                        // Ask user to confirm
                        <>
                            <button className="button button--white" onClick={callOnCancel}>
                                Cancel
                                </button>
                            <button
                                className={classNames("button", warning ? "button--red" : "")}
                                onClick={run}
                            >
                                Confirm
                            </button>
                        </>
            }
        </div>
    </div>;
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
    // onDone?: (() => void) | (() => Promise<void>);
}

export const MultiStepPopup = MultiStepPopupClass;
