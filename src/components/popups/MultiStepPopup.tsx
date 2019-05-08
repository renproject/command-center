import * as React from "react";

import BigNumber from "bignumber.js";

import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators, Dispatch } from "redux";

import { _captureBackgroundException_, _captureInteractionException_ } from "../../lib/errors";
import { ErrorCanceledByUser } from "../../lib/ethereum/wallet";
import { clearPopup } from "../../store/actions/popup/popupActions";
import { ApplicationData } from "../../store/types";
import { Loading } from "../Loading";

import Warn from "../../styles/images/warn.svg";

const defaultState = { // Entries must be immutable
    running: false,
    complete: false,
    rejected: false,
    currentStep: 0,
    error: null as Error | null,
    bond: null as BigNumber | null,
    warningIgnored: false,
};

/**
 * MultiStepPopup is a popup component that prompts the user to approve a
 * series of Ethereum transactions
 */
class MultiStepPopupClass extends React.Component<Props, typeof defaultState> {

    constructor(props: Props) {
        super(props);
        this.state = defaultState;
    }

    public componentDidMount = () => {
        if (!this.props.confirm) {
            this.run()
                .catch((error) => {
                    _captureBackgroundException_(error, {
                        description: "Error in getAtomicBalances action",
                    });
                });
        }
    }

    public render = (): JSX.Element => {
        const { error, currentStep, running, complete, rejected, warningIgnored } = this.state;
        const { warning, ignoreWarning } = this.props;

        const notStarted = !running && !complete && !error;

        const transactionS = this.props.steps.length === 1 ? "Transaction" : "Transaction";

        // Show a warning to the user
        if (warning && notStarted && !warningIgnored) {
            return <div className="popup multi-step">
                <div className="multi-step--top">
                    <img alt="" role="presentation" src={Warn} />
                    <h2 className={ignoreWarning ? "multi-step--with-ignore" : ""}>{warning}</h2>
                    {ignoreWarning ?
                        <span
                            onClick={this.onIgnoreWarning}
                            className="multi-step--ignore"
                            role="button"
                        >
                            {ignoreWarning}
                        </span> :
                        null
                    }
                </div>
                <div className="multi-step--buttons" >
                    <button className="button button--white" onClick={this.onCancel}>Cancel</button>
                    {!ignoreWarning ?
                        <button className={`button ${warning ? "button--red" : ""}`} onClick={this.run}>
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
                    {rejected ? `${transactionS} rejected` : complete ? `${transactionS} submitted` : this.props.title}
                </h2>
                {!notStarted && this.props.steps.length > 1 ? <ul className="multi-step--list">
                    {
                        this.props.steps.map((
                            step: { name: string; call(): Promise<void> },
                            index: number,
                        ) => {
                            const checked = (currentStep > index) || (currentStep === index && !!error);
                            return <li key={index}>
                                <input
                                    className={`checkbox ${currentStep === index && error ? "checkbox--error" : ""}`}
                                    type="checkbox"
                                    value="None"
                                    id="slideThree"
                                    name="check"
                                    checked={checked}
                                    readOnly={true}
                                />
                                <span className={index === currentStep ? "active" : ""}>
                                    Step {index + 1}: {step.name}
                                </span>
                            </li>;
                        })
                    }
                </ul> : null}

                {!rejected && error ?
                    <p className="popup--error red">Unable to complete transaction: {error.message}</p> :
                    null
                }

            </div>

            <div className="multi-step--buttons" >
                {running ?
                    // Show spinning icon while running through steps
                    <button className="button button--white" disabled={true}><Loading /></button> :
                    complete ?
                        // Get user to click Close instead of automatically closing popup
                        <>
                            <button className="button" onClick={this.onDone}>
                                Close
                            </button>
                        </> :
                        error ?
                            // Let user cancel or retry after error
                            <>
                                <button className="button button--white" onClick={this.onCancel}>
                                    Cancel
                                </button>
                                <button className="button button--white" onClick={this.run}>
                                    Retry
                                </button>
                            </> :
                            // Ask user to confirm
                            <>
                                <button className="button button--white" onClick={this.onCancel}>
                                    Cancel
                                </button>
                                <button
                                    className={`button ${warning ? "button--red" : ""}`}
                                    onClick={this.run}
                                >
                                    Confirm
                                </button>
                            </>
                }
            </div>
        </div>;
    }

    private readonly onIgnoreWarning = (): void => {
        this.setState({ warningIgnored: true });
    }

    private readonly onCancel = (): void => {
        const { onCancel } = this.props;
        if (onCancel) {
            const promiseOrVoid = onCancel();
            if (promiseOrVoid) {
                promiseOrVoid.catch((error) => {
                    _captureBackgroundException_(error, {
                        description: "Error in onCancel in MultiStepPopup"
                    });
                });
            }
        }
        this.props.actions.clearPopup();
    }

    private readonly onDone = () => {
        // const { onDone } = this.props;
        // if (onDone) {
        //     const promiseOrVoid = onDone();
        //     if (promiseOrVoid) {
        //         promiseOrVoid.catch(console.error);
        //     }
        // }
        this.props.actions.clearPopup();
    }

    private readonly run = async () => {
        this.setState({ error: null, running: true, rejected: false });

        let { currentStep } = this.state;
        const { steps } = this.props;
        while (currentStep < steps.length) {
            try {
                await steps[currentStep].call();
            } catch (error) {
                const rejected = (error.message || "").match(ErrorCanceledByUser);
                if (!rejected) {
                    _captureInteractionException_(error, {
                        description: "Error throw in MultiStepPopup",
                        shownToUser: "As message box in MultiStepPopup",
                    });
                }
                this.setState({ error, running: false, rejected });
                return;
            }
            currentStep += 1;
            this.setState({ currentStep });
        }

        this.setState({ running: false, complete: true });
    }

}

const mapStateToProps = (_state: ApplicationData) => ({
    store: {
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        clearPopup,
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
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

export const MultiStepPopup = connect(mapStateToProps, mapDispatchToProps)(MultiStepPopupClass);
