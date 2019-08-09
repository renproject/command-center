import * as React from "react";

import { Blocky, Loading } from "@renproject/react-components";
import { connect, ConnectedReturnType } from "react-redux";
import { bindActionCreators } from "redux";

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

        // const x = <div
        //     className="header--group"
        //     ref={this.setRef}
        // >
        //     <div className="header--selected" role="menuitem" onClick={this.toggle}>
        //         <span>{selected.render}</span><Chevron style={{ opacity: 0.6 }} />
        //     </div>
        //     {shown ?
        //         <div className="header--dropdown--spacing header--dropdown--options">
        //             <ul className="header--dropdown">
        //                 {
        //                     OrderedMap(options).map((render, value) => <li
        //                         key={value}
        //                         role="button"
        //                         data-id={value}
        //                         className={`${value === selected.value ?
        //                             "header--dropdown--selected" :
        //                             ""} header--dropdown--option`}
        //                         onClick={this.onClick}
        //                     >
        //                         {render}
        //                     </li>).valueSeq().toArray()}
        //             </ul>
        //         </div> : null
        //     }
        // </div>;

        return <div
            className="header--group header--group--account"
            ref={this.setRef}
        >
            <div className="header--account header--selected header--selected" role="menuitem" onClick={this.toggle}>
                {address && <Blocky address={address} />}
                <div
                    className={`header--account--right ${address ?
                        "header--account--connected" :
                        "header--account--disconnected"}`}
                >
                    <div className="header--account--type">
                        {web3BrowserName} {pendingTXs ? <Loading alt={true} className="header--account--spinner" /> : <></>}
                    </div>
                    {address ?
                        <div className="header--account--address">
                            {address.substring(0, 8)}...{address.slice(-5)}
                        </div> :
                        <div className="header--account--address">Not connected</div>
                    }
                </div>
            </div>

            {shown ?
                <div className="header--dropdown--spacing header--dropdown--options header--dropdown--accounts">
                    <ul className={`header--dropdown ${!address ? "header--dropdown--login" : ""}`}>
                        {address ? <>
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
                        </> :
                            <li
                                role="button"
                                onClick={this.handleLogin}
                                className="header--dropdown--option header--dropdown--highlight"
                            >
                                Connect {web3BrowserName}
                            </li>
                        }
                    </ul>
                </div> : <></>
            }
        </div>;
    }

    private readonly handleLogin = async (): Promise<void> => {
        const { address, renNetwork } = this.props.store;
        if (!address) {
            await this.props.actions.login(renNetwork, { redirect: false, showPopup: true, immediatePopup: true });
        }
    }

    private readonly handleLogout = async (): Promise<void> => {
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
        login: promptLogin,
        logout,
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
}

export const AccountDropdown = connect(mapStateToProps, mapDispatchToProps)(AccountDropdownClass);
