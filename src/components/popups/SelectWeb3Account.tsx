import * as React from "react";

import RenExSDK from "renex-sdk-ts";

import { connect } from "react-redux";

import Blocky from "@Components/Blocky";
import Loading from "@Components/Loading";

import { ApplicationData } from "@Reducers/types";

interface StoreProps {
    sdk: RenExSDK;
}

interface SelectWeb3AccountProps extends StoreProps {
    message: string;
    getAccounts(): Promise<string[]>;
    resolve(address: string): void;
    reject(address: string, reason: string): void;
}

interface SelectWeb3AccountState {
    accounts: string[] | null;
    error: string | null;
}

export const WyreVerification = 0;
export const KyberVerification = 1;

/**
 * SelectWeb3Account is a popup component for prompting a user to select an
 * Ethereum account
 */
class SelectWeb3Account extends React.Component<SelectWeb3AccountProps, SelectWeb3AccountState> {
    constructor(props: SelectWeb3AccountProps) {
        super(props);
        this.state = {
            accounts: null,
            error: null,
        };
    }

    public async componentDidMount() {
        await this.getAccounts();
    }

    public render(): JSX.Element {
        const { accounts, error } = this.state;

        if (error) {
            return (
                <div className="popup ledger">
                    <h2>Unable to retrieve accounts</h2>
                    <p>{error}</p>
                    <button onClick={this.getAccounts}>Retry</button>
                </div>
            );
        }

        return (
            <div className="popup accounts">
                {accounts !== null ?
                    <>
                        <h2>Select an account:</h2>
                        {accounts.map((account, i) =>
                            <button key={i} data-item={i} className="account--button" onClick={this.onSelectAccount}>
                                <div className="account--left">
                                    <Blocky address={account} />
                                </div>
                                <div className="account--right">
                                    <span className="monospace">{account}</span>
                                </div>
                            </button>
                        )}
                    </>
                    :
                    <Loading />
                }
            </div>
        );
    }

    private getAccounts = async () => {
        this.setState({ error: null });
        let accounts;
        try {
            accounts = await this.props.getAccounts();
        } catch (error) {
            this.setState({ error: (error as Error).message || error.toString() });
            return;
        }
        if (accounts.length === 1) {
            await this.props.resolve(accounts[0]);
            return;
        }
        this.setState({ accounts });
    }

    private onSelectAccount = async (event: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
        const { accounts } = this.state;
        const selectedAccountIndex = parseInt(event.currentTarget.getAttribute("data-item") || "0", 10);

        if (selectedAccountIndex === null || accounts === null || accounts.length < selectedAccountIndex) {
            console.error("No account selected");
            return;
        }
        const address = accounts[selectedAccountIndex];
        await this.props.resolve(address);
    }
}

function mapStateToProps(state: ApplicationData): StoreProps {
    return {
        sdk: state.trader.sdk,
    };
}

export default connect(mapStateToProps)(SelectWeb3Account);
