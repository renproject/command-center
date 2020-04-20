import * as React from "react";

import { Loading } from "@renproject/react-components";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators } from "redux";

import { NULL, RegistrationStatus } from "../../../lib/ethereum/contractReads";
import { _catchInteractionException_ } from "../../../lib/react/errors";
import { DarknodesState } from "../../../store/applicationState";
import {
    showDeregisterPopup, showRefundPopup, showRegisterPopup, updateDarknodeDetails,
    updateOperatorDarknodes,
} from "../../../store/network/networkActions";
import { NetworkStateContainer } from "../../../store/networkStateContainer";
import { PopupContainer } from "../../../store/popupStore";
import { AppDispatch } from "../../../store/rootReducer";
import { Web3Container } from "../../../store/web3Store";

export const statusText = {
    [RegistrationStatus.Unknown]: "Loading...",
    [RegistrationStatus.Unregistered]: "Deregistered",
    [RegistrationStatus.RegistrationPending]: "Registration pending",
    [RegistrationStatus.Registered]: "Registered",
    [RegistrationStatus.DeregistrationPending]: "Deregistration pending",
    [RegistrationStatus.Deregistered]: "Awaiting Refund Period",
    [RegistrationStatus.Refundable]: "Refundable",
};

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    actions: bindActionCreators({
        showRegisterPopup,
        showDeregisterPopup,
        showRefundPopup,
        updateDarknodeDetails,
        updateOperatorDarknodes,
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
    isOperator: boolean;
    registrationStatus: RegistrationStatus;
    darknodeID: string;
    darknodeDetails: DarknodesState | null;
    publicKey?: string;
}

const RegistrationClass: React.StatelessComponent<Props> = ({ darknodeID, darknodeDetails, registrationStatus, isOperator, publicKey, actions }) => {
    const { setPopup } = PopupContainer.useContainer();
    const { web3, address, renNetwork } = Web3Container.useContainer();
    const { tokenPrices, quoteCurrency, unhideDarknode } = NetworkStateContainer.useContainer();

    const { darknodeList } = NetworkStateContainer.useContainer();
    const accountDarknodeList = React.useMemo(() => address ? darknodeList.get(address, null) : null, [darknodeList]);

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
            await actions.updateOperatorDarknodes(web3, renNetwork, address, tokenPrices, accountDarknodeList);
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
            unhideDarknode({ darknodeID, operator: address, network: renNetwork.name });
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
