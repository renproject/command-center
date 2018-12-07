import * as React from "react";

import Web3 from "web3";

import Header from "./Header";
import contracts, { INFURA_KEY } from "./lib/contracts";
import Loading from "./Loading";

import RenExSDK from "@renex/renex";
import { FeesBlock } from "./FeesBlock";
import { Token, TokenDetails, Tokens } from "./lib/tokens";
import { StatusBlock } from "./StatusBlock";
import { TokenBalance } from "./TokenBalance";
import { Topup } from "./Topup";



import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { ApplicationData } from "@Reducers/types";

interface StoreProps {
    selectedDarknode: string;
    sdk: RenExSDK;
}

interface StatusPageProps extends StoreProps {

    actions: {
    };
}

interface StatusPageState {
    network: string;
    multiAddress: string;
    darknodeAddress: string;
    publicKey: string;
    peers: number;
    success: boolean;
    registrationStatus: string;
    minBond: number;
    balances: BalanceItem[];
    currentBalance: number;
    error: boolean;
    errorMessage: JSX.Element | null;
    refreshing: boolean;
    correctNetwork: boolean;
}

interface BalanceItem {
    token: Token;
    balance: string;
}

class StatusPage extends React.Component<StatusPageProps, StatusPageState> {

    public constructor(props: StatusPageProps, context: object) {
        super(props, context);
        this.state = {
            network: "",
            multiAddress: "",
            darknodeAddress: "",
            publicKey: "",
            peers: 0,
            success: false,
            registrationStatus: "",
            minBond: 0,
            balances: [],
            currentBalance: 0,
            error: false,
            errorMessage: null,
            refreshing: false,
            correctNetwork: true
        };
        this.refreshInfo = this.refreshInfo.bind(this);
    }

    public async componentDidMount(): Promise<void> {
        const { sdk, selectedDarknode } = this.props;
        Promise.all(
            [
                this.getMinBond(),
                this.getDarknodeStatus(),
                this.getBalances(),
                sdk.getWeb3().eth.getBalance(selectedDarknode),
            ])
            .then((res) => {
                const minBond = res[0];
                const registrationStatus = res[1];
                const balances = res[2];
                const currentBalance = parseInt(res[3].toString(), 10);

                this.setState({
                    success: true,
                    registrationStatus,
                    minBond,
                    balances,
                    currentBalance,
                }, () => {
                    // Refresh darknode information every 10 seconds.
                    const callRefreshInfo = async () => {
                        try {
                            await this.refreshInfo();
                        } catch (err) {
                            console.error(err);
                        }
                        setTimeout(callRefreshInfo, 10 * 1000);
                    };
                    callRefreshInfo().catch(console.error);
                });
            })
            .catch((err) => {
                console.error(err);
            });
    }

    public async componentWillReceiveProps(nextProps: StatusPageProps): Promise<void> {
        if (this.props.selectedDarknode !== nextProps.selectedDarknode) {
            this.setState({
                network: "",
                multiAddress: "",
                darknodeAddress: "",
                publicKey: "",
                peers: 0,
                success: false,
                registrationStatus: "",
                minBond: 0,
                balances: [],
                currentBalance: 0,
                error: false,
                errorMessage: null,
                refreshing: false,
                correctNetwork: true
            });

            const { sdk, selectedDarknode } = nextProps;
            Promise.all(
                [
                    this.getMinBond(),
                    this.getDarknodeStatus(),
                    this.getBalances(),
                    sdk.getWeb3().eth.getBalance(selectedDarknode),
                ])
                .then((res) => {
                    const minBond = res[0];
                    const registrationStatus = res[1];
                    const balances = res[2];
                    const currentBalance = parseInt(res[3].toString(), 10);

                    this.setState({
                        success: true,
                        registrationStatus,
                        minBond,
                        balances,
                        currentBalance,
                    }, () => {
                        // Refresh darknode information every 10 seconds.
                        const callRefreshInfo = async () => {
                            try {
                                await this.refreshInfo();
                            } catch (err) {
                                console.error(err);
                            }
                            setTimeout(callRefreshInfo, 10 * 1000);
                        };
                        callRefreshInfo().catch(console.error);
                    });
                })
                .catch((err) => {
                    console.error(err);
                });
        }
    }

    public async componentDidUpdate(): Promise<void> {
        // if (!this.balanceInterval && this.state.darknodeAddress) {
        //     this.balanceInterval = setInterval(async () => {
        //         const currentBalance = await this.web3.eth.getBalance(this.state.darknodeAddress);
        //         if (currentBalance !== this.state.currentBalance) {
        //             this.setState({ currentBalance });
        //         }
        //     }, 5000);
        // }
    }

    public render(): JSX.Element {
        const { sdk } = this.props;

        return (
            <div className="statuspage container">
                <Header />
                {
                    this.state.error ?
                        this.state.errorMessage
                        :

                        <div className="content">
                            {this.state.success && !!sdk ? <>
                                <div>
                                    <StatusBlock sdk={sdk} web3={sdk.getWeb3()} registrationStatus={this.state.registrationStatus} publicKey={this.state.publicKey} network={this.state.network} multiAddress={this.state.multiAddress} darknodeAddress={this.state.darknodeAddress} peers={this.state.peers} minBond={this.state.minBond} />
                                </div>
                                <div>
                                    <h1>Balance</h1>
                                    <TokenBalance token={Token.ETH} amount={this.state.currentBalance.toString()} min={0} />
                                    <h1>Top-up Balance</h1>
                                    <Topup web3={sdk.getWeb3()} network={this.state.network} darknodeAddress={this.state.darknodeAddress} />
                                    <h1>Fees Earned</h1>
                                    {
                                        this.state.balances.map((item: BalanceItem, key: number) => {
                                            return (
                                                <FeesBlock key={key} web3={sdk.getWeb3()} token={item.token} amount={item.balance} darknodeAddress={this.state.darknodeAddress} network={this.state.network} />
                                            );
                                        })
                                    }
                                </div>
                            </> : <Loading fixed />}
                        </div>
                }
            </div>
        );
    }

    private async refreshInfo(): Promise<void> {
        const { sdk } = this.props;

        this.setState({ refreshing: true });
        return await Promise.all(
            [
                this.getDarknodeStatus(),
                this.getBalances(),
                sdk.getWeb3().eth.getBalance(this.state.darknodeAddress),
            ])
            .then((res) => {
                const registrationStatus = res[0];
                const balances = res[1];
                const currentBalance = parseInt(res[2].toString(), 10);
                this.setState({
                    peers: 0,
                    registrationStatus,
                    balances,
                    currentBalance,
                    refreshing: false
                });
            })
            .catch((err) => {
                console.error(err);
            });
    }

    private async getBalances(): Promise<BalanceItem[]> {
        const { sdk, selectedDarknode } = this.props;
        const contract = new (sdk.getWeb3().eth.Contract)(contracts.DarknodeRewardVault.ABI, contracts.DarknodeRewardVault.address);
        const balances = Tokens.map(async (token: Token) => {
            // tslint:disable-next-line:no-non-null-assertion
            const tokenDetails = TokenDetails.get(token)!;
            const balance = await contract.methods.darknodeBalances(selectedDarknode, tokenDetails.address).call();
            return {
                token,
                balance
            };
        });
        const res = await Promise.all(balances);
        return res;
    }

    private async getDarknodeStatus(): Promise<string> {
        const { sdk, selectedDarknode } = this.props;

        return new Promise<string>((resolve) => {
            Promise.all([
                sdk._contracts.darknodeRegistry.isPendingRegistration(selectedDarknode, {}),
                sdk._contracts.darknodeRegistry.isPendingDeregistration(selectedDarknode, {}),
                sdk._contracts.darknodeRegistry.isDeregisterable(selectedDarknode, {}),
                sdk._contracts.darknodeRegistry.isRefunded(selectedDarknode, {}),
                sdk._contracts.darknodeRegistry.isRefundable(selectedDarknode, {}),
                sdk._contracts.darknodeRegistry.isRegistered(selectedDarknode, {}),
            ]).then((response) => {
                const res = {
                    isPendingRegistration: response[0],
                    isPendingDeregistration: response[1],
                    isDeregisterable: response[2],
                    isRefunded: response[3],
                    isRefundable: response[4],
                    isRegistered: response[5],
                };
                let registrationStatus = "";
                if (res.isRefunded) {
                    registrationStatus = "unregistered";
                } else if (res.isPendingRegistration) {
                    registrationStatus = "registrationPending";
                } else if (res.isDeregisterable) {
                    registrationStatus = "registered";
                } else if (res.isPendingDeregistration) {
                    registrationStatus = "deregistrationPending";
                } else if (res.isRefundable) {
                    registrationStatus = "awaitingRefund";
                }
                resolve(registrationStatus);
            })
                .catch(console.error);
        });
    }

    private async getMinBond(): Promise<number> {
        const { sdk } = this.props;
        return parseInt(await sdk._contracts.darknodeRegistry.minimumBond(), 10);
    }
}

function mapStateToProps(state: ApplicationData): StoreProps {
    return {
        // tslint:disable-next-line:no-non-null-assertion
        selectedDarknode: state.statistics.selectedDarknode!,
        // tslint:disable-next-line:no-non-null-assertion
        sdk: state.trader.sdk!,
    };
}

function mapDispatchToProps(dispatch: Dispatch): { actions: StatusPageProps["actions"] } {
    return {
        actions: bindActionCreators({
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(StatusPage);

