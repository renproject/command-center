import * as React from "react";

import { Blocky, Loading } from "@renproject/react-components";
import { connect, ConnectedReturnType } from "react-redux";
import { bindActionCreators } from "redux";

import { classNames } from "../../lib/react/className";
import { logout, promptLogin } from "../../store/account/accountActions";
import { ApplicationState } from "../../store/applicationState";
import { AppDispatch } from "../../store/rootReducer";

const defaultState = { // Entries must be immutable
    shown: false,
    copied: false,
};

// tslint:disable: react-unused-props-and-state
class AccountDropdownClass extends React.Component<Props, typeof defaultState> {
    private ref: HTMLDivElement | null = null;

    constructor(props: Props) {
        super(props);
        this.state = defaultState;
    }

    public render = () => {
        const { address, web3BrowserName, transactions, confirmations, renNetwork } = this.props.store;
        const { copied } = this.state;

        // `pendingTXs` calculates whether or not the user has any ethereum
        // transactions that haven't been confirmed yet.
        const pendingTXs = transactions.reduce((reduction: boolean, _value, key: string) => {
            return reduction || confirmations.get(key, 0) === 0;
        }, false);

        const { shown } = this.state;

        return <div
            className="header--group header--group--account"
            ref={this.setRef}
        >
            <div
                className={classNames("header--account", "header--selected", address ? "header--account--logged-in" : "header--account--logged-out")}
                role="menuitem"
                onClick={address ? this.toggle : this.handleLogin}
            >
                {address ?
                    <>
                        <Blocky address={address} />
                        <div className="header--account--right header--account--connected">
                            <div className="header--account--type">
                                {web3BrowserName} {pendingTXs ? <Loading alt className="header--account--spinner" /> : <></>}
                            </div>
                            <div className="header--account--address">
                                {address.substring(0, 8)}...{address.slice(-5)}
                            </div>
                        </div>
                    </> :
                    <>
                        <div className="wallet-icon">
                            <div className="wallet-icon--inner" />
                        </div>
                        <div className="header--account--right header--account--disconnected">
                            <div className="header--account--type">
                                Connect {web3BrowserName}
                            </div>
                            <div className="header--account--address">Manage your Darknode</div>
                        </div>
                    </>
                }
            </div>

            {address && shown ?
                <div className="header--dropdown--spacing header--dropdown--options header--dropdown--accounts">
                    <ul className={["header--dropdown", !address ? "header--dropdown--login" : ""].join(" ")}>
                        <li role="button" onClick={this.copyToClipboard} className="header--dropdown--option">
                            <span data-addr={address}>
                                {copied ?
                                    <span>Copied</span>
                                    :
                                    <span>Copy to clipboard</span>
                                }
                            </span>
                        </li>
                        <li
                            role="button"
                            onClick={this.handleLogout}
                            className="header--dropdown--option"
                        >
                            Log out
                        </li>
                        {transactions.size > 0 ?
                            <>
                                {transactions.map((_tx, txHash) => {
                                    const confs = confirmations.get(txHash, 0);
                                    return <li key={txHash} className="transaction">
                                        {confs === 0 ? <Loading /> : <></>}
                                        {confs === -1 ? <span className="red">(ERR) {" "}</span> : <></>}
                                        <a className="transaction--hash" target="_blank" rel="noopener noreferrer" href={`${renNetwork.etherscan}/tx/${txHash}`}>{txHash.substring(0, 12)}...</a>
                                        {confs > 0 ? <>{" "}({confs} conf.)</> : ""}
                                    </li>;
                                }).valueSeq().toArray()}
                            </> : <></>
                        }
                    </ul>
                </div> : <></>
            }
        </div>;
    }

    private readonly handleLogin = async (): Promise<void> => {
        const { address } = this.props.store;
        this.setState({ shown: false });
        if (!address) {
            await this.props.actions.promptLogin({ manual: true, redirect: false, showPopup: true, immediatePopup: true });
        }
    }

    private readonly handleLogout = async (): Promise<void> => {
        this.setState({ shown: false });
        this.props.actions.logout();
    }

    private readonly copyToClipboard = (e: React.MouseEvent<HTMLElement>): void => {
        const el = e.currentTarget.childNodes[0] as Element;
        const address = el.getAttribute("data-addr");
        if (address) {
            const fauxInput = document.createElement("input");
            document.body.appendChild(fauxInput);
            fauxInput.setAttribute("value", address);
            fauxInput.select();
            document.execCommand("copy");
            document.body.removeChild(fauxInput);
        }
        this.setState({ copied: true });
    }

    private readonly setRef = (ref: HTMLDivElement) => {
        this.ref = ref;
    }

    // tslint:disable-next-line: no-any
    private readonly clickAway = (event: any) => {
        // tslint:disable-next-line: no-any
        if ((this.ref && !this.ref.contains(event.target))) {
            this.setState({ shown: false });
        }
        document.removeEventListener("mousedown", this.clickAway);
        // @ts-ignore
    }

    private readonly toggle = () => {
        const newShown = !this.state.shown;
        this.setState({ shown: newShown });

        if (newShown) {
            document.addEventListener("mousedown", this.clickAway);
        } else {
            document.removeEventListener("mousedown", this.clickAway);
        }
    }
}

const mapStateToProps = (state: ApplicationState) => ({
    store: {
        address: state.account.address,
        web3BrowserName: state.account.web3BrowserName,
        quoteCurrency: state.network.quoteCurrency,
        web3: state.account.web3,
        transactions: state.network.transactions,
        confirmations: state.network.confirmations,
        renNetwork: state.account.renNetwork,
    },
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    actions: bindActionCreators({
        promptLogin,
        logout,
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
}

export const AccountDropdown = connect(mapStateToProps, mapDispatchToProps)(AccountDropdownClass);
