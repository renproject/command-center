import * as React from "react";

import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import RenExSDK from "renex-sdk-ts";

import Footer from "@Components/Footer";
import Header from "@Components/Header";
import Loading from "@Components/Loading";
import NetworkStatistics from "@Components/NetworkStatistics";
import Wallets from "@Components/Wallets";

import { setAlert, SetAlertAction } from "@Actions/alert/alertActions";
import { login, LoginAction } from "@Actions/trader/accountActions";
import { storeWallet, StoreWalletAction } from "@Actions/trader/walletActions";
import { ApplicationData } from "@Reducers/types";


interface HomeProps {
    sdk: RenExSDK;
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
        const { checkingVerification } = this.state;
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
                <Wallets />
                <NetworkStatistics />
                <div className="content" />
                <Footer />
            </div>
        );
    }
}

function mapStateToProps(state: ApplicationData) {
    return {
        sdk: state.trader.sdk,
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
