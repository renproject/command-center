import * as React from "react";

import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators } from "redux";

import { ApplicationState } from "../../store/applicationState";
import { AppDispatch } from "../../store/rootReducer";
import { _catch_ } from "../common/ErrorBoundary";
import { DarknodeList } from "./darknodeList/DarknodeList";

/**
 * Home is a page whose principal components are wallet selection to allow users
 * to log-in, and the hidden orderbook
 */
class AllDarknodesClass extends React.Component<Props> {
    public constructor(props: Props, context: object) {
        super(props, context);
    }

    public render = (): JSX.Element => {
        const { darknodeList, darknodeNames, darknodeDetails, darknodeRegisteringList, registrySync, address, renNetwork } = this.props.store;

        return (
            <div className="home" key={`${address || undefined} ${renNetwork.name}`}>
                <div className="container">
                    {darknodeRegisteringList.size > 0 ? <>
                        <h2>Continue registering</h2>
                        {_catch_(<DarknodeList
                            darknodeDetails={darknodeDetails}
                            darknodeNames={darknodeNames}
                            darknodeList={darknodeRegisteringList.keySeq().toOrderedSet()}
                            darknodeRegisteringList={darknodeRegisteringList}
                            registrySync={registrySync}
                        />)}
                        {(darknodeList && darknodeList.size > 0) ? <h2>Current darknodes</h2> : null}
                    </> : null}
                    {darknodeRegisteringList.size === 0 || (darknodeList && darknodeList.size > 0) ? _catch_(<DarknodeList
                        darknodeDetails={darknodeDetails}
                        darknodeNames={darknodeNames}
                        darknodeList={darknodeList}
                        darknodeRegisteringList={darknodeRegisteringList}
                        registrySync={registrySync}
                    />) : null}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: ApplicationState) => ({
    store: {
        address: state.account.address,
        darknodeDetails: state.network.darknodeDetails,
        darknodeNames: state.network.darknodeNames,
        darknodeList: state.account.address ? state.network.darknodeList.get(state.account.address, null) : null,
        darknodeRegisteringList: state.network.darknodeRegisteringList,
        registrySync: state.network.registrySync,
        renNetwork: state.account.renNetwork,
        web3: state.account.web3,
    },
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    actions: bindActionCreators({
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
}

export const AllDarknodes = connect(mapStateToProps, mapDispatchToProps)(AllDarknodesClass);
