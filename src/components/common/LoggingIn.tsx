import * as React from "react";

import { connect, ConnectedReturnType } from "react-redux";
import { bindActionCreators } from "redux";

import { _catchBackgroundException_ } from "../../lib/react/errors";
import { promptLogin } from "../../store/account/accountActions";
import { ApplicationState } from "../../store/applicationState";
import { AppDispatch } from "../../store/rootReducer";
import { EmptyDarknodeList } from "../allDarknodesPage/darknodeList/EmptyDarknodeList";

/**
 * LoggingIn is a page whose principal components are wallet selection to allow users
 * to log-in, and the hidden orderbook
 */
const LoggingInClass = (props: Props) => {

    const { address } = props.store;

    const handleLogin = React.useCallback(async (): Promise<void> => {
        if (!address) {
            await props.actions.promptLogin({ manual: false, redirect: false, showPopup: true, immediatePopup: false });
        }
    }, [address]);

    React.useEffect(() => {
        handleLogin().catch((error) => _catchBackgroundException_(error, "Error in LoggingIn > handleLogin"));
    }, []);

    return <div className="logging-in">
        <EmptyDarknodeList />
    </div>;
};

const mapStateToProps = (state: ApplicationState) => ({
    store: {
        address: state.account.address,
        web3BrowserName: state.account.web3BrowserName,
        quoteCurrency: state.network.quoteCurrency,
        web3: state.account.web3,
        transactions: state.network.transactions,
        confirmations: state.network.confirmations,
        renNetwork: state.account.renNetwork,
    },
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    actions: bindActionCreators({
        promptLogin,
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
}

export const LoggingIn = connect(mapStateToProps, mapDispatchToProps)(LoggingInClass);
