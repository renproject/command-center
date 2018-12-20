import * as React from "react";

import BigNumber from "bignumber.js";

import { bindActionCreators, Dispatch } from "redux";

import { clearPopup } from "@Actions/popup/popupActions";
import { Loading } from "@Components/Loading";
import { ErrorCanceledByUser } from "@Library/wallets/wallet";
import { ApplicationData } from "@Reducers/types";
import { connect } from "react-redux";

interface MultiStepPopupProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
    steps: Array<{
        call: () => Promise<void>;
        name: string;
    }>;

    title: string;
    confirm: boolean;

    onCancel?: (() => void) | (() => Promise<void>);
    // onDone?: (() => void) | (() => Promise<void>);
}

interface MultiStepPopupState {
    currentStep: number;
    running: boolean;
    complete: boolean;

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
            currentStep: 0,
            error: null,
            bond: null,
        };
    }

    public componentDidMount = () => {
        if (!this.props.confirm) {
            this.run().catch(console.error);
        }
    }

    public render(): JSX.Element {
        const { error, currentStep, running, complete } = this.state;

        return <div className="popup approve">
            <h2>{complete ? "Transactions submitted" : this.props.title}</h2>

            {this.props.steps.length > 1 ? <ul className="approve--list">
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

            {this.renderError(error)}

            <div className="popup--buttons" >
                {running ?
                    <button className="styled-button styled-button--light" disabled={true}><Loading /></button> :
                    complete ?
                        <>
                            <button className="styled-button" onClick={this.onDone}>Close</button>
                        </> :
                        error ?
                            <>
                                <button className="styled-button styled-button--light" onClick={this.onCancel}>Cancel</button>
                                <button className="styled-button styled-button--light" onClick={this.run}>Retry</button>
                            </> :
                            <>
                                <button className="styled-button styled-button--light" onClick={this.onCancel}>Cancel</button>
                                <button className="styled-button" onClick={this.run}>Confirm</button>
                            </>
                }
            </div>
        </div>;
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

    private renderError = (error: Error | null) => {
        if (!error) {
            return <></>;
        }

        if (error.message === ErrorCanceledByUser) {
            return <p>Transaction canceled</p>;
        }

        return <p className="popup--error red">Unable to complete transaction: {error.message}</p>;
    }

    private run = async () => {
        this.setState({ error: null, running: true });

        let { currentStep } = this.state;
        const { steps } = this.props;
        while (currentStep < steps.length) {
            try {
                await steps[currentStep].call();
            } catch (error) {
                console.error(error);
                this.setState({ error, running: false });
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
