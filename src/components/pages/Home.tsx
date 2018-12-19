import * as React from "react";

import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { Header } from "@Components/Header";

import { setAlert } from "@Actions/alert/alertActions";
import { login } from "@Actions/trader/accountActions";
import { DarknodeList } from "@Components/DarknodeList";
import { ApplicationData } from "@Reducers/types";

interface HomeProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
}

interface HomeState {
    checkingVerification: boolean;
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
        };
    }

    public render(): JSX.Element {
        const { darknodeDetails, darknodeNames, darknodeList } = this.props.store;

        return (
            <div className="home">
                <Header />
                <div className="container">
                    <DarknodeList darknodeDetails={darknodeDetails} darknodeNames={darknodeNames} darknodeList={darknodeList} />
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
