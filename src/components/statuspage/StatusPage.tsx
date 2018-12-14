import * as React from "react";

import RenExSDK from "@renex/renex";

import { Map } from "immutable";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { Blocky } from "@Components/Blocky";

import { updateDarknodeStatistics } from "@Actions/statistics/operatorActions";
import { ApplicationData, DarknodeDetails } from "@Reducers/types";
import { FeesBlock } from "./FeesBlock";
import { GasBlock } from "./GasBlock";
import { NetworkBlock } from "./NetworkBlock";
import { Registration } from "./Registration";

interface StatusPageProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
    sdk: RenExSDK;
    darknodeID: string;
    darknodeDetails: DarknodeDetails | null;
    operator: boolean;
}

interface StatusPageState {
    network: string;
    success: boolean;
    minBond: number;
    refreshing: boolean;
    correctNetwork: boolean;
    darknodeActionCalled: Map<string, boolean>;
}

class StatusPageClass extends React.Component<StatusPageProps, StatusPageState> {

    public constructor(props: StatusPageProps, context: object) {
        super(props, context);
        this.state = {
            network: "",
            success: false,
            minBond: 0,
            refreshing: false,
            correctNetwork: true,
            darknodeActionCalled: Map(),
        };
    }

    public render(): JSX.Element {
        const { sdk, darknodeDetails, darknodeID, operator } = this.props;

        return (
            <div className="statuspage">
                <div className="statuspage--banner">
                    <Blocky address={darknodeID} fgColor="#006FE8" bgColor="transparent" />
                    <div className="statuspage--banner--details">
                        <div className="statuspage--banner--top">
                            <h3>{darknodeDetails ? darknodeDetails.name : <span className="monospace">{darknodeID.substring(0, 8)}...{darknodeID.slice(-5)}</span>}</h3>
                            {operator ? <button>Edit name</button> : null}
                            <button>View details</button>
                        </div>
                        {darknodeDetails ?
                            <Registration sdk={this.props.sdk} operator={operator} minBond={this.state.minBond} registrationStatus={darknodeDetails.registrationStatus} network={this.state.network} darknodeAddress={darknodeDetails.ID} publicKey={darknodeDetails.publicKey} /> :
                            null
                        }
                    </div>
                </div>
                <div className="statuspage--bottom">
                    <FeesBlock sdk={sdk} operator={operator} darknodeDetails={darknodeDetails} />
                    <GasBlock sdk={sdk} operator={operator} darknodeDetails={darknodeDetails} />
                    <NetworkBlock sdk={sdk} darknodeDetails={darknodeDetails} network={this.state.network} minBond={this.state.minBond} />

                    {/* <div className="statuspage--graphs">
                            <div>
                                Income graph
                            </div>
                            <div>
                                Gas graph
                            </div>
                        </div> */}
                </div>
            </div>
        );
    }

    // private async getMinBond(): Promise<number> {
    //     const { sdk } = this.props;
    //     return parseInt(await sdk._contracts.darknodeRegistry.minimumBond(), 10);
    // }
}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        tokenPrices: state.statistics.tokenPrices,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        updateDarknodeStatistics,
    }, dispatch),
});

export const StatusPage = connect(mapStateToProps, mapDispatchToProps)(StatusPageClass);

