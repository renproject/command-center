import * as React from "react";

import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import Header from "@Components/Header";
import Loading from "@Components/Loading";
import Sidebar from "@Components/Sidebar";

import { setAlert, SetAlertAction } from "@Actions/alert/alertActions";
import { login, LoginAction } from "@Actions/trader/accountActions";
import { storeWallet, StoreWalletAction } from "@Actions/trader/walletActions";
import { ApplicationData } from "@Reducers/types";


interface HomeProps {
    address: string;
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
        const { address } = this.props;
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
                <div className="content" />
                {address ?
                    <Sidebar /> :
                    <></>
                }
            </div>
        );
    }
}

function mapStateToProps(state: ApplicationData) {
    return {
        address: state.trader.address,
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
