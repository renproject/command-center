import * as React from "react";

import { connect, ConnectedReturnType } from "react-redux";
import { bindActionCreators } from "redux";

import { _catchBackgroundException_ } from "../../lib/react/errors";
import { promptLogin } from "../../store/account/accountActions";
import { PopupContainer } from "../../store/popupStore";
import { AppDispatch } from "../../store/rootReducer";
import { Web3Container } from "../../store/web3Store";
import { EmptyDarknodeList } from "../allDarknodesPage/darknodeList/EmptyDarknodeList";

/**
 * LoggingIn is a page whose principal components are wallet selection to allow users
 * to log-in, and the hidden orderbook
 */
const LoggingInClass = ({ actions }: Props) => {
    const { setPopup, clearPopup } = PopupContainer.useContainer();
    const { address } = Web3Container.useContainer();

    const handleLogin = React.useCallback(async (): Promise<void> => {
        if (!address) {
            await actions.promptLogin(setPopup, clearPopup, { manual: false, redirect: false, showPopup: true, immediatePopup: false });
        }
    }, [address]);

    React.useEffect(() => {
        handleLogin().catch((error) => _catchBackgroundException_(error, "Error in LoggingIn > handleLogin"));
    }, []);

    return <div className="logging-in">
        <EmptyDarknodeList />
    </div>;
};

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    actions: bindActionCreators({
        promptLogin,
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
}

export const LoggingIn = connect(mapStateToProps, mapDispatchToProps)(LoggingInClass);
