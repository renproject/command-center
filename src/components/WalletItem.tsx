import * as React from "react";

import RenExSDK from "renex-sdk-ts";
import Web3 from "web3";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { bindActionCreators } from "redux";
import { Provider } from "web3/types";

import SelectWeb3Account from "@Components/popups/SelectWeb3Account";

import { setAlert, SetAlertAction } from "@Actions/alert/alertActions";
import { clearPopup, ClearPopupAction, setPopup, SetPopupAction } from "@Actions/popup/popupActions";
import { login, LoginAction } from "@Actions/trader/accountActions";
import { storeWallet, StoreWalletAction } from "@Actions/trader/walletActions";
import { networkData } from "@Library/network";
import { ErrorCanceledByUser, Wallet, WalletDetails } from "@Library/wallets/wallet";
import { Alert, AlertType, ApplicationData } from "@Reducers/types";

interface StoreProps {
    sdk: RenExSDK;
}

interface WalletItemProps extends StoreProps {
    wallet: Wallet;
    actions: {
        setAlert: SetAlertAction;
        storeWallet: StoreWalletAction;
        setPopup: SetPopupAction;
        clearPopup: ClearPopupAction;
        login: LoginAction;
    };
}

interface WalletItemState {
    canceled: boolean;
}

/**
 * WalletItem is a visual component representing an individual wallet selection
 */
class WalletItem extends React.Component<WalletItemProps, WalletItemState> {
    public constructor(props: WalletItemProps, context: object) {
        super(props, context);
        this.state = {
            canceled: false
        };
    }

    public render(): JSX.Element {
        const { wallet } = this.props;
        const walletDetails = WalletDetails.get(wallet, undefined);

        if (walletDetails === undefined) {
            return <></>;
        }

        const { slug, enabled, description, name } = walletDetails;

        return (
            <div className={`wallets--container ${slug} ${enabled ? "" : "disabled"}`}>
                <div
                    className="wallets--item"
                    role="button"
                    onClick={this.handleSelectWallet}
                >
                    <span className="wallets--title">{name}</span>
                    <p className="wallets--description">
                        {!enabled ?
                            "Coming soon" : null
                        }
                        {enabled && description !== "" ?
                            description : null
                        }
                    </p>
                </div>
            </div>
        );
    }

    private handleSelectWallet = async (): Promise<void> => {
        const { sdk, wallet } = this.props;

        const walletDetails = WalletDetails.get(wallet, undefined);
        if (!walletDetails) {
            return;
        }
        const { getWeb3Provider } = walletDetails;

        this.setState({ canceled: false });
        this.props.actions.storeWallet({ wallet });

        // Retrieve web3.
        let provider: Provider;
        let providerAccounts: string[] | null;
        try {
            [provider, providerAccounts] = await getWeb3Provider();
        } catch (err) {
            if (err.message !== ErrorCanceledByUser) {
                this.props.actions.setAlert({
                    alert: new Alert({ message: err.message })
                });
            }
            this.props.actions.storeWallet({ wallet: null });
            return;
        }

        const resolve = async (address: string) => {
            await this.props.actions.login(sdk, provider, address, { redirect: true });
            this.props.actions.clearPopup();
        };

        const reject = (address: string, reason: string) => {
            cancel();
        };

        const cancel = () => {
            this.props.actions.clearPopup();

            // Set the state to canceled, so any pending verification is
            // halted.
            this.setState({ canceled: true });
        };

        const getAccounts = async () => {
            const web3 = new Web3(provider);

            let accounts;
            try {
                accounts = providerAccounts ? providerAccounts : await web3.eth.getAccounts();
            } catch (err) {
                if (wallet === Wallet.Ledger && err.message.match(/invalid transport instance/)) {
                    throw new Error("Unable to connect to Ledger.");
                } else {
                    throw err;
                }
            }

            if (accounts.length === 0) {
                if (wallet === Wallet.MetaMask) {
                    throw new Error("Please unlock your Metamask.");
                } else {
                    throw new Error("No accounts found. Your wallet may be locked.");
                }
            }

            // Check that wallet is on correct network (except for Ledger and
            // Keystore, for which we have already set the network)
            if (wallet !== Wallet.Ledger && wallet !== Wallet.Keystore) {
                // tslint:disable-next-line:no-any
                const network = await (web3.eth.net as any).getNetworkType();

                if (network !== networkData.ethNetwork) {
                    throw new Error(`Please ensure you are on the ${networkData.ethNetworkLabel} network`);
                }
            }

            return accounts;
        };

        const popup = {
            popup: <SelectWeb3Account getAccounts={getAccounts} resolve={resolve} reject={reject} message={"Select account"} />,
            onCancel: cancel,
        };

        this.props.actions.setPopup(popup);
    }
}

function mapStateToProps(state: ApplicationData): StoreProps {
    return {
        sdk: state.trader.sdk,
    };
}

function mapDispatchToProps(dispatch: Dispatch): { actions: WalletItemProps["actions"] } {
    return {
        actions: bindActionCreators({
            setAlert,
            storeWallet,
            setPopup,
            clearPopup,
            login,
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(WalletItem);
