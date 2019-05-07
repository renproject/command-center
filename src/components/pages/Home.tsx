import * as React from "react";

import { List } from "immutable";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators, Dispatch } from "redux";

import { ApplicationData } from "../../store/types";
import { DarknodeList } from "../darknodeList/DarknodeList";
import { _catch_ } from "../ErrorBoundary";

const defaultState = {
    checkingVerification: false,
    darknodeList: null as List<string> | null,
};

/**
 * Home is a page whose principal components are wallet selection to allow users
 * to log-in, and the hidden orderbook
 */
class HomeClass extends React.Component<Props, typeof defaultState> {
    public constructor(props: Props, context: object) {
        super(props, context);
        this.state = defaultState;
    }

    public render = (): JSX.Element => {
        const { darknodeList, darknodeNames, darknodeDetails, darknodeRegisteringList } = this.props.store;

        return (
            <div className="home">
                <div className="container">
                    {darknodeRegisteringList.size > 0 ? <>
                        <h2>Continue registering</h2>
                        {_catch_(<DarknodeList
                            darknodeDetails={darknodeDetails}
                            darknodeNames={darknodeNames}
                            darknodeList={darknodeRegisteringList.keySeq().toList()}
                            darknodeRegisteringList={darknodeRegisteringList}
                        />)}
                        {(darknodeList && darknodeList.size > 0) ? <h2>Current darknodes</h2> : null}
                    </> : null}
                    {darknodeRegisteringList.size === 0 || (darknodeList && darknodeList.size > 0) ? _catch_(<DarknodeList
                        darknodeDetails={darknodeDetails}
                        darknodeNames={darknodeNames}
                        darknodeList={darknodeList}
                        darknodeRegisteringList={darknodeRegisteringList}
                    />) : null}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        address: state.trader.address,
        darknodeDetails: state.statistics.darknodeDetails,
        darknodeNames: state.statistics.darknodeNames,
        darknodeList: state.trader.address ? state.statistics.darknodeList.get(state.trader.address, null) : null,
        darknodeRegisteringList: state.statistics.darknodeRegisteringList,
        web3: state.trader.web3,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
}

export const Home = connect(mapStateToProps, mapDispatchToProps)(HomeClass);
