import * as React from "react";

import BigNumber from "bignumber.js";

import { bindActionCreators, Dispatch } from "redux";

// import { SetPopupPayload } from "@Actions/popup/popupActions";
import { clearPopup } from "@Actions/popup/popupActions";
import { updateDarknodeStatistics } from "@Actions/statistics/operatorActions";
import { approveNode, registerNode } from "@Actions/trader/darknode";
import { Loading } from "@Components/Loading";
import { ErrorCanceledByUser } from "@Library/wallets/wallet";
import { ApplicationData } from "@Reducers/types";
import { connect } from "react-redux";

interface RegisterPopupProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
    darknodeID: string;
    publicKey: string;
    onCancel?: () => void;
}

interface RegisterPopupState {
    currentStep: number;
    running: boolean;
    complete: boolean;

    error: Error | null;
    bond: BigNumber | null;
}

/**
 * RegisterPopup is a popup component that prompts the user to approve a
 * series of Ethereum transactions
 */
export class RegisterPopupClass extends React.Component<RegisterPopupProps, RegisterPopupState> {

    private steps = [
        { call: () => this.step1(), name: "Approve 100'000 REN" },
        { call: () => this.step2(), name: "Register darknode" },
    ];

    constructor(props: RegisterPopupProps) {
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
        this.run().catch(console.error);
    }

    public render(): JSX.Element {
        const { error, currentStep, running, complete } = this.state;

        return <div className="popup approve">
            <h2>Register darknode</h2>

            <ul className="approve--list">
                {
                    this.steps.map((step, index: number) => {
                        const checked = (currentStep > index) || (currentStep === index && !!error);
                        return <li key={index}>
                            <input className={`checkbox ${currentStep === index && error ? "checkbox--error" : ""}`} type="checkbox" value="None" id="slideThree" name="check" checked={checked} />
                            <span className={index === currentStep ? "active" : ""}>Step {index + 1}: {step.name}</span>
                        </li>;
                    })
                }
            </ul>

            {this.renderError(error)}

            < div className="popup--buttons" >
                {!running ?
                    complete ?
                        <>
                            <button onClick={this.onDone}>Close</button>
                        </> :
                        error ?
                            <>
                                <button onClick={this.onCancel}>Cancel</button>
                                <button onClick={this.run}>Retry</button>
                            </> :
                            <>
                                <button onClick={this.onCancel}>Cancel</button>
                                <button onClick={this.run}>Confirm</button>
                            </>
                    : <button disabled={true}><Loading /></button>}
            </div>
        </div>;
    }

    private onCancel = () => {
        const { onCancel } = this.props;
        if (onCancel) {
            onCancel();
        }
        this.props.actions.clearPopup();
    }

    private onDone = () => {
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
        while (currentStep < this.steps.length) {
            try {
                await this.steps[currentStep].call();
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

    private step1 = async () => {
        const { store: { sdk, minimumBond } } = this.props;
        const bond = minimumBond || new BigNumber(100000);
        await this.props.actions.approveNode(sdk, bond);
        this.setState({ bond });

    }

    private step2 = async () => {
        const { darknodeID, publicKey, store: { sdk, tokenPrices, darknodeDetails } } = this.props;
        const { bond } = this.state;
        await this.props.actions.registerNode(sdk, darknodeID, publicKey, bond || new BigNumber(100000));
        this.setState({ bond });

        if (tokenPrices) {
            try {
                const details = darknodeDetails.get(darknodeID);
                await this.props.actions.updateDarknodeStatistics(sdk, darknodeID, tokenPrices, details);
            } catch (error) {
                console.error(error);
            }
        }
    }
}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        sdk: state.trader.sdk,
        minimumBond: state.statistics.minimumBond,
        tokenPrices: state.statistics.tokenPrices,
        darknodeDetails: state.statistics.darknodeDetails,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        clearPopup,
        approveNode,
        registerNode,
        updateDarknodeStatistics,
    }, dispatch),
});

export const RegisterPopup = connect(mapStateToProps, mapDispatchToProps)(RegisterPopupClass);


// export const newRegisterPopup = (onCancelAction: () => void): SetPopupPayload => ({
//     popup: <RegisterPopup cancel={onCancelAction} />,
//     dismissible: false,
//     onCancel: onCancelAction,
// });
