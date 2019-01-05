import * as React from "react";

import { List } from "immutable";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { setAlert } from "../../actions/alert/alertActions";
import { login } from "../../actions/trader/accountActions";
import { DarknodeList } from "../../components/DarknodeList";
import { ApplicationData } from "../../reducers/types";

interface HomeProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
}

interface HomeState {
    checkingVerification: boolean;
    darknodeList: List<string> | null;
}

/**
 * Home is a page whose principal components are wallet selection to allow users
 * to log-in, and the hidden orderbook
 */
class HomeClass extends React.Component<HomeProps, HomeState> {
    public constructor(props: HomeProps, context: object) {
        super(props, context);
        this.state = {
            checkingVerification: false,
            darknodeList: null,
        };
    }

    public render(): JSX.Element {
        const { darknodeList, darknodeNames, darknodeDetails, darknodeRegisteringList } = this.props.store;

        return (
            <div className="home">
                <div className="container">
                    {darknodeRegisteringList.size > 0 ? <>
                        <h2>Continue registering</h2>
                        <DarknodeList
                            darknodeDetails={darknodeDetails}
                            darknodeNames={darknodeNames}
                            darknodeList={darknodeRegisteringList.keySeq().toList()}
                            darknodeRegisteringList={darknodeRegisteringList}
                        />
                        <h2>Current darknodes</h2>
                    </> : null}
                    <DarknodeList
                        darknodeDetails={darknodeDetails}
                        darknodeNames={darknodeNames}
                        darknodeList={darknodeList}
                        darknodeRegisteringList={darknodeRegisteringList}
                    />
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
        sdk: state.trader.sdk,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        login,
        setAlert,
    }, dispatch),
});

export const Home = connect(mapStateToProps, mapDispatchToProps)(HomeClass);
