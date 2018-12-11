import * as React from "react";

import RenExSDK from "@renex/renex";

import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { Blocky } from "@Components/Blocky";
import { Loading } from "@Components/Loading";

import { updateDarknodeStatistics, UpdateDarknodeStatisticsAction, } from "@Actions/statistics/operatorActions";
import { ApplicationData, DarknodeDetails } from "@Reducers/types";
import { FeesBlock } from "./FeesBlock";
import { GasBlock } from "./GasBlock";
import { NetworkBlock } from "./NetworkBlock";
import { Registration } from "./Registration";
import { TokenBalance } from "./TokenBalance";

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
    refreshing: boolean;
    correctNetwork: boolean;
}

class StatusPageClass extends React.Component<StatusPageProps, StatusPageState> {

    public constructor(props: StatusPageProps, context: object) {
        super(props, context);
        this.state = {
            network: "",
            success: false,
            minBond: 0,
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
        const { sdk, darknodeDetails, darknodeID } = this.props;

        return (
            <div className="statuspage container">
                {!darknodeDetails ? <Loading alt /> : <>
                    <div className="statuspage--banner">
                        <Blocky address={darknodeID} />
                        <div className="statuspage--banner--details">
                            <div className="statuspage--banner--top">
                                <h3>Darknode</h3>
                                <button>Edit name</button>
                                <button>View details</button>
                            </div>
                            <Registration sdk={this.props.sdk} web3={this.props.sdk.getWeb3()} minBond={this.state.minBond} registrationStatus={darknodeDetails.registrationStatus} network={this.state.network} darknodeAddress={darknodeDetails.ID} publicKey={darknodeDetails.publicKey} />
                        </div>
                    </div>
                    <div className="statuspage--bottom">
                        <FeesBlock sdk={sdk} darknodeDetails={darknodeDetails} />
                        <GasBlock sdk={sdk} darknodeDetails={darknodeDetails} />
                        <NetworkBlock sdk={sdk} web3={sdk.getWeb3()} registrationStatus={darknodeDetails.registrationStatus} publicKey={darknodeDetails.publicKey} network={this.state.network} multiAddress={darknodeDetails.multiAddress} darknodeAddress={darknodeDetails.ID} peers={darknodeDetails.peers} minBond={this.state.minBond} />

                        {/* <div className="statuspage--graphs">
                            <div>
                                Income graph
                            </div>
                            <div>
                                Gas graph
                            </div>
                        </div> */}
                    </div>
                </>}
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

export const StatusPage = connect(mapStateToProps, mapDispatchToProps)(StatusPageClass);

