import * as React from "react";

import { Blocky, Loading } from "@renproject/react-components";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators } from "redux";

import { _catchBackgroundException_ } from "../../../lib/react/errors";
import { ApplicationState } from "../../../store/applicationState";
import { AppDispatch } from "../../../store/rootReducer";

const defaultState = { // Entries must be immutable
    accounts: null as string[] | null,
    error: null as string | null,
};

/**
 * SelectWeb3Account is a popup component for prompting a user to select an
 * Ethereum account
 */
class SelectWeb3AccountClass extends React.Component<Props, typeof defaultState> {
    constructor(props: Props) {
        super(props);
        this.state = defaultState;
    }

    public componentDidMount = async (): Promise<void> => {
        await this.getAccounts();
    }

    public render = (): JSX.Element => {
        const { accounts, error } = this.state;

        if (error) {
            return (
                <div className="popup accounts">
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
                        {accounts.map((account: string, i: number) =>
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

    private readonly getAccounts = async () => {
        this.setState({ error: null });
        let accounts;
        try {
            accounts = await this.props.getAccounts();
        } catch (error) {
            this.setState({ error: (error as Error).message || error.toString() });
            return;
        }
        if (accounts.length === 1) {
            this.props.resolve(accounts[0]);
            return;
        }
        this.setState({ accounts });
    }

    private readonly onSelectAccount = async (event: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
        const { accounts } = this.state;
        const selectedAccountIndex = parseInt(event.currentTarget.getAttribute("data-item") || "0", 10);

        if (isNaN(selectedAccountIndex) || accounts === null || accounts.length < selectedAccountIndex) {
            const description = "No account selected in onSelectAccount";
            _catchBackgroundException_(new Error(description), {
                description,
            });
            return;
        }
        const address = accounts[selectedAccountIndex];
        this.props.resolve(address);
    }
}

const mapStateToProps = (_state: ApplicationState) => ({
    store: {
    },
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    actions: bindActionCreators({
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
    // message: string;
    getAccounts(): Promise<string[]>;
    resolve(address: string): void;
    // reject(address: string, reason: string): void;
}

export const SelectWeb3Account = connect(mapStateToProps, mapDispatchToProps)(SelectWeb3AccountClass);
