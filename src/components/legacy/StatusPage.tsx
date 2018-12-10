import * as React from "react";

import RenExSDK from "@renex/renex";

import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import Loading from "./Loading";

import { updateDarknodeStatistics, UpdateDarknodeStatisticsAction, } from "@Actions/statistics/operatorActions";
import { ApplicationData, DarknodeDetails } from "@Reducers/types";
import { FeesBlock } from "./FeesBlock";
import { Token } from "./lib/tokens";
import { StatusBlock } from "./StatusBlock";
import { TokenBalance } from "./TokenBalance";
import { Topup } from "./Topup";

interface StoreProps {
}

interface StatusPageProps extends StoreProps {
    sdk: RenExSDK;
    darknodeID: string;
    darknodeDetails: DarknodeDetails | null;

    actions: {
        updateDarknodeStatistics: UpdateDarknodeStatisticsAction,
    };
}

interface StatusPageState {
    network: string;
    success: boolean;
    minBond: number;
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
            success: false,
            minBond: 0,
            error: false,
            errorMessage: null,
            refreshing: false,
            correctNetwork: true
        };
    }

    public async componentDidMount(): Promise<void> {
        const { sdk, darknodeID, darknodeDetails } = this.props;
        if (darknodeID && !darknodeDetails) {
            await this.props.actions.updateDarknodeStatistics(sdk, darknodeID);
        }
    }

    public async componentWillReceiveProps(nextProps: StatusPageProps) {
        const { sdk, darknodeID, darknodeDetails } = nextProps;
        if (darknodeID && !darknodeDetails) {
            await nextProps.actions.updateDarknodeStatistics(sdk, darknodeID);
        }
    }

    public render(): JSX.Element {
        const { sdk, darknodeDetails } = this.props;

        return (
            <div className="statuspage container">
                {
                    this.state.error ?
                        this.state.errorMessage
                        :
                        <div className="content">
                            {darknodeDetails ? <>
                                <div>
                                    <StatusBlock sdk={sdk} web3={sdk.getWeb3()} registrationStatus={darknodeDetails.registrationStatus} publicKey={darknodeDetails.publicKey} network={this.state.network} multiAddress={darknodeDetails.multiAddress} darknodeAddress={darknodeDetails.ID} peers={darknodeDetails.peers} minBond={this.state.minBond} />
                                </div>
                                <div>
                                    <h1>Balance</h1>
                                    <TokenBalance token={Token.ETH} amount={darknodeDetails.ethBalance.toString()} min={0} />
                                    <h1>Top-up Balance</h1>
                                    <Topup web3={sdk.getWeb3()} network={this.state.network} darknodeAddress={darknodeDetails.ID} />
                                    <h1>Fees Earned</h1>
                                    {
                                        darknodeDetails.feesEarned.map((balance: string, token: Token) => {
                                            return (
                                                <FeesBlock key={token} web3={sdk.getWeb3()} token={token} amount={balance} darknodeAddress={darknodeDetails.ID} network={this.state.network} />
                                            );
                                        }).valueSeq().toArray()
                                    }
                                </div>
                            </> : <Loading fixed />}
                        </div>
                }
            </div>
        );
    }

    // private async getMinBond(): Promise<number> {
    //     const { sdk } = this.props;
    //     return parseInt(await sdk._contracts.darknodeRegistry.minimumBond(), 10);
    // }
}

function mapStateToProps(state: ApplicationData): StoreProps {
    return {
    };
}

function mapDispatchToProps(dispatch: Dispatch): { actions: StatusPageProps["actions"] } {
    return {
        actions: bindActionCreators({
            updateDarknodeStatistics,
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(StatusPage);

