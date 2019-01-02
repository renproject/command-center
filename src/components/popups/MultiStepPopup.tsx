import * as React from "react";

import BigNumber from "bignumber.js";

import { bindActionCreators, Dispatch } from "redux";

import { clearPopup } from "@Actions/popup/popupActions";
import { Loading } from "@Components/Loading";
import { ErrorCanceledByUser } from "@Library/wallets/wallet";
import { ApplicationData } from "@Reducers/types";
import { connect } from "react-redux";

import Warn from "../../styles/images/warn.svg";

interface MultiStepPopupProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
    steps: Array<{
        call: () => Promise<void>;
        name: string;
    }>;

    title: string;
    confirm: boolean;
    warning?: string | JSX.Element;
    ignoreWarning?: string;

    onCancel?: (() => void) | (() => Promise<void>);
    // onDone?: (() => void) | (() => Promise<void>);
}

interface MultiStepPopupState {
    currentStep: number;
    running: boolean;
    complete: boolean;
    rejected: boolean;
    warningIgnored: boolean;

    error: Error | null;
    bond: BigNumber | null;
}

/**
 * MultiStepPopup is a popup component that prompts the user to approve a
 * series of Ethereum transactions
 */
export class MultiStepPopupClass extends React.Component<MultiStepPopupProps, MultiStepPopupState> {

    constructor(props: MultiStepPopupProps) {
        super(props);
        this.state = {
            running: false,
            complete: false,
            rejected: false,
            currentStep: 0,
            error: null,
            bond: null,
            warningIgnored: false,
        };
    }

    public componentDidMount = () => {
        if (!this.props.confirm) {
            this.run().catch(console.error);
        }
    }

    public render(): JSX.Element {
        const { error, currentStep, running, complete, rejected, warningIgnored } = this.state;
        const { warning, ignoreWarning } = this.props;

        const notStarted = !running && !complete && !error;

        const transactionS = this.props.steps.length === 1 ? "Transaction" : "Transaction";


        // Show a warning to the user
        if (warning && notStarted && !warningIgnored) {
            return <div className="popup multi-step">
                <div className="multi-step--top">
                    <img src={Warn} />
                    <h2 className={ignoreWarning ? "multi-step--with-ignore" : ""}>{warning}</h2>
                    {ignoreWarning ? <span onClick={this.onIgnoreWarning} className="multi-step--ignore">{ignoreWarning}</span> : null}
                </div>
                <div className="multi-step--buttons" >
                    <button className="styled-button styled-button--light" onClick={this.onCancel}>Cancel</button>
                    {!ignoreWarning ? <button className={`styled-button ${warning ? "styled-button--red" : ""}`} onClick={this.run}>Confirm</button> : null}
                </div>
            </div>;
        }

        return <div className="popup multi-step">
            <div className="multi-step--top">
                <h2 className={rejected ? "red" : ""}>{rejected ? `${transactionS} rejected` : complete ? `${transactionS} submitted` : this.props.title}</h2>
                {!notStarted && this.props.steps.length > 1 ? <ul className="multi-step--list">
                    {
                        this.props.steps.map((step, index: number) => {
                            const checked = (currentStep > index) || (currentStep === index && !!error);
                            return <li key={index}>
                                <input className={`checkbox ${currentStep === index && error ? "checkbox--error" : ""}`} type="checkbox" value="None" id="slideThree" name="check" checked={checked} />
                                <span className={index === currentStep ? "active" : ""}>Step {index + 1}: {step.name}</span>
                            </li>;
                        })
                    }
                </ul> : null}

                {!rejected && error ? <p className="popup--error red">Unable to complete transaction: {error.message}</p> : null}

            </div>

            <div className="multi-step--buttons" >
                {running ?
                    // Show spinning icon while running through steps
                    <button className="styled-button styled-button--light" disabled={true}><Loading /></button> :
                    complete ?
                        // Get user to click Close instead of automatically closing popup
                        <>
                            <button className="styled-button" onClick={this.onDone}>Close</button>
                        </> :
                        error ?
                            // Let user cancel or retry after error
                            <>
                                <button className="styled-button styled-button--light" onClick={this.onCancel}>Cancel</button>
                                <button className="styled-button styled-button--light" onClick={this.run}>Retry</button>
                            </> :
                            // Ask user to confirm
                            <>
                                <button className="styled-button styled-button--light" onClick={this.onCancel}>Cancel</button>
                                <button className={`styled-button ${warning ? "styled-button--red" : ""}`} onClick={this.run}>Confirm</button>
                            </>
                }
            </div>
        </div>;
    }

    private onIgnoreWarning = () => {
        this.setState({ warningIgnored: true });
    }

    private onCancel = () => {
        const { onCancel } = this.props;
        if (onCancel) {
            const promiseOrVoid = onCancel();
            if (promiseOrVoid) {
                promiseOrVoid.catch(console.error);
            }
        }
        this.props.actions.clearPopup();
    }

    private onDone = () => {
        // const { onDone } = this.props;
        // if (onDone) {
        //     const promiseOrVoid = onDone();
        //     if (promiseOrVoid) {
        //         promiseOrVoid.catch(console.error);
        //     }
        // }
        this.props.actions.clearPopup();
    }

    private run = async () => {
        this.setState({ error: null, running: true, rejected: false });

        let { currentStep } = this.state;
        const { steps } = this.props;
        while (currentStep < steps.length) {
            try {
                await steps[currentStep].call();
            } catch (error) {
                const rejected = error.message === ErrorCanceledByUser;
                this.setState({ error, running: false, rejected });
                return;
            }
            currentStep += 1;
            this.setState({ currentStep });
        }

        this.setState({ running: false, complete: true });
    }


}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        clearPopup,
    }, dispatch),
});

export const MultiStepPopup = connect(mapStateToProps, mapDispatchToProps)(MultiStepPopupClass);
