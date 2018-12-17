import * as React from "react";

import RenExSDK from "@renex/renex";

import { Map } from "immutable";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { Blocky } from "@Components/Blocky";

import { updateDarknodeStatistics } from "@Actions/statistics/operatorActions";
import { DarknodeAction } from "@Components/pages/Darknode";
import { ApplicationData, DarknodeDetails } from "@Reducers/types";
import { FeesBlock } from "./FeesBlock";
import { GasBlock } from "./GasBlock";
import { NetworkBlock } from "./NetworkBlock";
import { Registration } from "./Registration";

interface StatusPageProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
    action: DarknodeAction;
    publicKey: string | undefined;
    darknodeID: string;
    darknodeDetails: DarknodeDetails | null;
    operator: boolean;
}

interface StatusPageState {
    network: string;
    success: boolean;
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
            refreshing: false,
            correctNetwork: true,
            darknodeActionCalled: Map(),
        };
    }

    public render(): JSX.Element {
        const { darknodeDetails, darknodeID, operator, action, publicKey } = this.props;

        return (
            <div className={`statuspage ${action !== DarknodeAction.View ? `statuspage--focused` : ``}`}>
                <div className="statuspage--banner">
                    <Blocky address={darknodeID} fgColor="#006FE8" bgColor="transparent" />
                    <div className="statuspage--banner--details">
                        <div className="statuspage--banner--top">
                            <h3>{darknodeDetails ? darknodeDetails.name : <span className="monospace">{darknodeID.substring(0, 8)}...{darknodeID.slice(-5)}</span>}</h3>
                            {operator ? <button>Edit name</button> : null}
                            <button>View details</button>
                        </div>

                        {action === DarknodeAction.Register ?
                            <Registration operator={true} registrationStatus={"unregistered"} publicKey={publicKey} network={this.state.network} darknodeID={darknodeID} /> :
                            null
                        }
                        {action !== DarknodeAction.Register && darknodeDetails ?
                            <Registration operator={operator} registrationStatus={darknodeDetails.registrationStatus} network={this.state.network} darknodeID={darknodeID} /> :
                            null
                        }
                    </div>
                </div>
                <div className="statuspage--bottom">
                    <FeesBlock operator={operator} darknodeDetails={darknodeDetails} />
                    <GasBlock operator={operator} darknodeDetails={darknodeDetails} />
                    <NetworkBlock darknodeDetails={darknodeDetails} network={this.state.network} />
                </div>
            </div>
        );
    }
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

