import * as React from "react";

import { Loading } from "@renproject/react-components";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators } from "redux";

import { NULL, RegistrationStatus } from "../../../lib/ethereum/contractReads";
import { _catchInteractionException_ } from "../../../lib/react/errors";
import {
    showDeregisterPopup, showRefundPopup, showRegisterPopup,
} from "../../../store/account/operatorPopupActions";
import { ApplicationState, DarknodesState } from "../../../store/applicationState";
import {
    unhideDarknode, updateDarknodeDetails, updateOperatorDarknodes,
} from "../../../store/network/operatorActions";
import { PopupContainer } from "../../../store/popupStore";
import { AppDispatch } from "../../../store/rootReducer";

export const statusText = {
    [RegistrationStatus.Unknown]: "Loading...",
    [RegistrationStatus.Unregistered]: "Deregistered",
    [RegistrationStatus.RegistrationPending]: "Registration pending",
    [RegistrationStatus.Registered]: "Registered",
    [RegistrationStatus.DeregistrationPending]: "Deregistration pending",
    [RegistrationStatus.Deregistered]: "Awaiting Refund Period",
    [RegistrationStatus.Refundable]: "Refundable",
};

const mapStateToProps = (state: ApplicationState) => ({
    store: {
        address: state.account.address,
        web3: state.account.web3,
        tokenPrices: state.network.tokenPrices,
        darknodeList: state.account.address ? state.network.darknodeList.get(state.account.address, null) : null,
        quoteCurrency: state.network.quoteCurrency,
        renNetwork: state.account.renNetwork,
    },
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    actions: bindActionCreators({
        showRegisterPopup,
        showDeregisterPopup,
        showRefundPopup,
        updateDarknodeDetails,
        updateOperatorDarknodes,
        unhideDarknode,
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
    isOperator: boolean;
    registrationStatus: RegistrationStatus;
    darknodeID: string;
    darknodeDetails: DarknodesState | null;
    publicKey?: string;
}

const RegistrationClass: React.StatelessComponent<Props> = ({ store: { web3, tokenPrices, address, darknodeList, renNetwork, quoteCurrency }, darknodeID, darknodeDetails, registrationStatus, isOperator, publicKey, store, actions }) => {
    const { setPopup } = PopupContainer.useContainer();

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
            await actions.updateDarknodeDetails(web3, renNetwork, darknodeID, tokenPrices);
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
            await actions.updateOperatorDarknodes(web3, renNetwork, address, tokenPrices, darknodeList);
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
            await actions.showRegisterPopup(
                web3, renNetwork, address, darknodeID, publicKey, tokenPrices, onCancel, onDoneRegister, setPopup,
            );
            actions.unhideDarknode({ darknodeID, operator: address, network: renNetwork.name });
        } catch (error) {
            _catchInteractionException_(error, "Error in Registration > handleRegister > showRegisterPopup");
            onCancel();
        }
    };

    const handleDeregister = async (): Promise<void> => {
        if (!address) {
            return;
        }

        setActive(true);
        await actions.showDeregisterPopup(
            web3,
            renNetwork,
            address,
            darknodeID,
            darknodeDetails && darknodeDetails.feesEarnedTotalEth,
            quoteCurrency,
            onCancel,
            onDone,
            setPopup,
        );
    };

    const handleRefund = async (): Promise<void> => {
        if (!address) {
            return;
        }

        setActive(true);
        await actions.showRefundPopup(setPopup, web3, renNetwork, address, darknodeID, onCancel, onDone);
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

export const Registration = connect(mapStateToProps, mapDispatchToProps)(RegistrationClass);
