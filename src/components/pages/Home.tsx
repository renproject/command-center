import * as React from "react";

import RenExSDK from "@renex/renex";

import { Map } from "immutable";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import Header from "@Components/Header";
import Loading from "@Components/Loading";
import Sidebar from "@Components/Sidebar";
import StatusPage from "@Components/statuspage/StatusPage";

import { setAlert, SetAlertAction } from "@Actions/alert/alertActions";
import { login, LoginAction } from "@Actions/trader/accountActions";
import { storeWallet, StoreWalletAction } from "@Actions/trader/walletActions";
import { ApplicationData, DarknodeDetails } from "@Reducers/types";

interface StoreProps {
    address: string | null;
    darknodeDetails: Map<string, DarknodeDetails>;
    sdk: RenExSDK | null;
    selectedDarknode: string | null;
}

interface HomeProps extends StoreProps {
    actions: {
        login: LoginAction;
        storeWallet: StoreWalletAction;
        setAlert: SetAlertAction;
    };
}

interface HomeState {
    checkingVerification: boolean;
}

/**
 * Home is a page whose principal components are wallet selection to allow users
 * to log-in, and the hidden orderbook
 */
class Home extends React.Component<HomeProps, HomeState> {
    public constructor(props: HomeProps, context: object) {
        super(props, context);
        this.state = {
            checkingVerification: false,
        };
    }

    public async componentDidMount(): Promise<void> {
        this.props.actions.storeWallet({ wallet: null });
    }

    public render(): JSX.Element {
        const { address, selectedDarknode, sdk, darknodeDetails } = this.props;
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
                <Header withMenu />
                <div className="content" />
                {sdk && address ?
                    <>
                        <Sidebar />
                        {selectedDarknode ? <StatusPage sdk={sdk} darknodeID={selectedDarknode} darknodeDetails={details} /> : <></>}
                    </> :
                    <></>
                }
            </div>
        );
    }
}

function mapStateToProps(state: ApplicationData): StoreProps {
    return {
        address: state.trader.address,
        darknodeDetails: state.statistics.darknodeDetails,
        sdk: state.trader.sdk,
        selectedDarknode: state.statistics.selectedDarknode,
    };
}

function mapDispatchToProps(dispatch: Dispatch): { actions: HomeProps["actions"] } {
    return {
        actions: bindActionCreators({
            login,
            storeWallet,
            setAlert,
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
