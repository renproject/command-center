import * as qs from "query-string";
import * as React from "react";

import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { RouteComponentProps, withRouter } from "react-router-dom";
import { bindActionCreators } from "redux";
import { List } from "immutable";

import { _captureBackgroundException_ } from "../../lib/react/errors";
import { lookForLogout, promptLogin } from "../../store/account/accountActions";
import { ApplicationState } from "../../store/applicationState";
import { updateTokenPrices } from "../../store/network/networkActions";
import {
    updateDarknodeDetails, updateOperatorDarknodes,
} from "../../store/network/operatorActions";
import { AppDispatch } from "../../store/rootReducer";
import { getDarknodeParam } from "../darknodePage/Darknode";

/**
 * BackgroundTasks is the main visual component responsible for displaying different routes
 * and running background app loops
 */
class BackgroundTasksClass extends React.Component<Props> {
    private callUpdatePricesTimeout: NodeJS.Timer | undefined;
    private callLookForLogoutInterval: NodeJS.Timer | undefined;
    private callUpdateOperatorDarknodesTimeout: NodeJS.Timer | undefined;
    private callUpdateSelectedDarknodeTimeout: NodeJS.Timer | undefined;

    public componentDidMount = async (): Promise<void> => {
        const { match: { params }, store: { renNetwork } } = this.props;

        const darknodeID = getDarknodeParam(params);

        const queryParams = qs.parse(this.props.location.search);
        const action = typeof queryParams.action === "string" ? queryParams.action : undefined;

        // Sometimes, logging in seems to freeze, to we start loops that don't
        // rely on being logged in before attempting to log in
        this.setupLoops();

        try {
            await this.props.actions.login(
                renNetwork,
                {
                    redirect: false,
                    showPopup: darknodeID === undefined || action !== undefined,
                    immediatePopup: false,
                }
            );
        } catch (error) {
            _captureBackgroundException_(error, {
                description: "Error logging in on load",
            });
        }

        this.setupLoopsWithAccount();
    }

    public componentWillReceiveProps = (nextProps: Props): void => {
        if (this.props.store.address !== nextProps.store.address) {
            this.callUpdateOperatorDarknodes(nextProps).catch(error => {
                _captureBackgroundException_(error, {
                    description: "Error in callUpdateOperatorDarknodes in BackgroundTasks",
                });
            });
        }

        const { match: { params: nextParams } } = nextProps;
        const { match: { params } } = this.props;

        const nextDarknodeID = getDarknodeParam(nextParams);
        const darknodeID = getDarknodeParam(params);

        if (darknodeID !== nextDarknodeID) {
            this.callUpdateSelectedDarknode(nextProps).catch(error => {
                _captureBackgroundException_(error, {
                    description: "Error in callUpdateSelectedDarknode in BackgroundTasks",
                });
            });
        }
    }

    public componentWillUnmount(): void {
        // Clear timeouts
        if (this.callUpdatePricesTimeout) { clearTimeout(this.callUpdatePricesTimeout); }
        if (this.callLookForLogoutInterval) { clearTimeout(this.callLookForLogoutInterval); }
        if (this.callUpdateOperatorDarknodesTimeout) { clearTimeout(this.callUpdateOperatorDarknodesTimeout); }
        if (this.callUpdateSelectedDarknodeTimeout) { clearTimeout(this.callUpdateSelectedDarknodeTimeout); }
    }

    public render = (): JSX.Element => <></>;

    // Update token prices every 60 seconds
    private readonly callUpdatePrices = async (): Promise<void> => {
        try {
            // tslint:disable-next-line: await-promise
            await this.props.actions.updateTokenPrices();
        } catch (error) {
            _captureBackgroundException_(error, {
                description: "Error thrown in callUpdatePrices background task",
            });
        }
        if (this.callUpdatePricesTimeout) { clearTimeout(this.callUpdatePricesTimeout); }
        this.callUpdatePricesTimeout = setTimeout(this.callUpdatePrices, 60 * 1000) as unknown as NodeJS.Timer;
    }

    // See if the user has logged out every 5 seconds
    private readonly callLookForLogout = async (): Promise<void> => {
        if (this.props.store.address) {
            await (this.props.actions.lookForLogout() as unknown as Promise<void>).catch((error) => {
                _captureBackgroundException_(error, {
                    description: "Error thrown in callLookForLogout background task",
                });
            });
        }
    }

    // Update operator statistics every 120 seconds
    private readonly callUpdateOperatorDarknodes = async (props?: Props): Promise<void> => {
        props = props || this.props;

        const { web3, address, tokenPrices, darknodeList, darknodeRegisteringList, renNetwork } = props.store;
        let timeout = 1; // Retry in a second, unless the call succeeds
        if (address && tokenPrices) {
            try {
                let list = null;
                if (darknodeRegisteringList.size > 0) {
                    list = darknodeRegisteringList.keySeq().toList();
                }
                if (darknodeList) {
                    list = (list || List()).concat(darknodeList);
                }
                // tslint:disable-next-line: await-promise
                await props.actions.updateOperatorDarknodes(web3, renNetwork, address, tokenPrices, list);
                timeout = 120;
            } catch (error) {
                _captureBackgroundException_(error, {
                    description: "Error thrown in callUpdateOperatorDarknodes background task",
                });
                timeout = 10;
            }
        }
        if (this.callUpdateOperatorDarknodesTimeout) { clearTimeout(this.callUpdateOperatorDarknodesTimeout); }
        this.callUpdateOperatorDarknodesTimeout = setTimeout(
            this.callUpdateOperatorDarknodes,
            timeout * 1000,
        ) as unknown as NodeJS.Timer;
    }

    // Update selected darknode statistics every 30 seconds
    private readonly callUpdateSelectedDarknode = async (props?: Props): Promise<void> => {
        props = props || this.props;

        const { match: { params } } = props;
        const { web3, tokenPrices, renNetwork } = props.store;

        const darknodeID = getDarknodeParam(params);

        let timeout = 1; // if the action isn't called, try again in 1 second
        if (tokenPrices && darknodeID) {
            try {
                // tslint:disable-next-line: await-promise
                await props.actions.updateDarknodeDetails(
                    web3,
                    renNetwork,
                    darknodeID,
                    tokenPrices,
                );
                timeout = 30;
            } catch (error) {
                _captureBackgroundException_(error, {
                    description: "Error thrown in callUpdateSelectedDarknode background task",
                });
                timeout = 15; // try again in half the time
            }
        }
        if (this.callUpdateSelectedDarknodeTimeout) { clearTimeout(this.callUpdateSelectedDarknodeTimeout); }
        this.callUpdateSelectedDarknodeTimeout = setTimeout(
            this.callUpdateSelectedDarknode,
            timeout * 1000,
        ) as unknown as NodeJS.Timer;
    }

    // tslint:disable-next-line:member-ordering
    public setupLoops(): void {
        this.callUpdatePrices().catch(error => {
            _captureBackgroundException_(error, {
                description: "Error in callUpdatePrices in BackgroundTasks",
            });
        });
        this.callUpdateSelectedDarknode().catch(error => {
            _captureBackgroundException_(error, {
                description: "Error in callUpdateSelectedDarknode in BackgroundTasks",
            });
        });
    }

    // tslint:disable-next-line:member-ordering
    public setupLoopsWithAccount(): void {
        this.callLookForLogoutInterval = setInterval(this.callLookForLogout, 5000);
        this.callUpdateOperatorDarknodes().catch(error => {
            _captureBackgroundException_(error, {
                description: "Error in callUpdateOperatorDarknodes in BackgroundTasks",
            });
        });
    }

}

const mapStateToProps = (state: ApplicationState) => ({
    store: {
        address: state.account.address,
        web3: state.account.web3,
        tokenPrices: state.network.tokenPrices,
        darknodeList: state.account.address ? state.network.darknodeList.get(state.account.address, null) : null,
        darknodeRegisteringList: state.network.darknodeRegisteringList,
        renNetwork: state.account.renNetwork,
    },
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    actions: bindActionCreators({
        login: promptLogin,
        lookForLogout,
        updateTokenPrices,
        updateOperatorDarknodes,
        updateDarknodeDetails,
    }, dispatch),
});

interface Props extends
    ReturnType<typeof mapStateToProps>,
    ConnectedReturnType<typeof mapDispatchToProps>,
    RouteComponentProps {
}

export const BackgroundTasks = connect(mapStateToProps, mapDispatchToProps)(withRouter(BackgroundTasksClass));
