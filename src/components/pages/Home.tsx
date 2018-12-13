import * as React from "react";

import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { Header } from "@Components/Header";
import { Loading } from "@Components/Loading";
import { Sidebar } from "@Components/Sidebar";
import { StatusPage } from "@Components/statuspage/StatusPage";

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
        const { address, selectedDarknode, sdk, darknodeDetails, darknodeList } = this.props.store;
        const { checkingVerification } = this.state;
        const details = selectedDarknode ? darknodeDetails.get(selectedDarknode, null) : null;

        return (
            <div className="login">
                {checkingVerification &&
                    <>
                        <div className="popup">
                            <Loading />
                        </div>
                        <div className="overlay" />
                    </>
                }
                <Header />
                <div className="content" />
                {sdk && address ?
                    <>
                        <Sidebar />
                        {selectedDarknode ? <StatusPage sdk={sdk} darknodeID={selectedDarknode} darknodeDetails={details} /> : <><DarknodeList darknodeDetails={darknodeDetails} darknodeList={darknodeList} /></>}
                    </> :
                    <></>
                }
            </div>
        );
    }
}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        address: state.trader.address,
        darknodeDetails: state.statistics.darknodeDetails,
        darknodeList: state.statistics.darknodeList,
        sdk: state.trader.sdk,
        selectedDarknode: state.statistics.selectedDarknode,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        login,
        setAlert,
    }, dispatch),
});

export const Home = connect(mapStateToProps, mapDispatchToProps)(HomeClass);
