import * as React from "react";

import { faStar } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CurrencyIcon, TokenIcon } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { OrderedMap } from "immutable";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators } from "redux";

import { DarknodeFeeStatus } from "../../../../lib/ethereum/contractReads";
import { OldToken, Token } from "../../../../lib/ethereum/tokens";
import { classNames } from "../../../../lib/react/className";
// import { showClaimPopup } from "../../../../store/account/operatorPopupActions";
import { ApplicationState, DarknodesState } from "../../../../store/applicationState";
import {
    updateCycleAndPendingRewards, updateDarknodeDetails,
} from "../../../../store/network/operatorActions";
import { AppDispatch } from "../../../../store/rootReducer";
import { ReactComponent as RewardsIcon } from "../../../../styles/images/icon-rewards-white.svg";
import { ReactComponent as WithdrawIcon } from "../../../../styles/images/icon-withdraw.svg";
import { Tabs } from "../../../common/Tabs";
import { TokenBalance } from "../../../common/TokenBalance";
import { FeesItem } from "../FeesItem";
import { Block, BlockBody, BlockTitle } from "./Block";

enum Tab {
    Withdrawable = "Withdrawable",
    Pending = "Pending",
}

const mergeFees = (left: OrderedMap<Token | OldToken, BigNumber>, right: OrderedMap<Token | OldToken, BigNumber>) => {
    let newFees = OrderedMap<Token | OldToken, BigNumber>();
    for (const token of left.keySeq().concat(right.keySeq()).toArray()) {
        newFees = newFees.set(token, new BigNumber(0).plus(left.get(token, new BigNumber(0)).plus(right.get(token, new BigNumber(0)))));
    }
    return newFees;
};

const defaultState = { // Entries must be immutable
    tab: Tab.Withdrawable,
    claiming: false,
    disableClaim: false,
};

class FeesBlockClass extends React.Component<Props, State> {
    private _isMounted = false;

    public constructor(props: Props, context: object) {
        super(props, context);
        this.state = defaultState;
    }

    public componentDidMount = async () => {
        this._isMounted = true;
    }

    public componentWillUnmount = () => {
        this._isMounted = false;
    }

    public componentWillReceiveProps = (nextProps: Props) => {
        // If the darknode's cycles have been updated
        if (this.state.disableClaim && nextProps.darknodeDetails && this.props.darknodeDetails &&
            nextProps.darknodeDetails.cycleStatus.keySeq().first() !== this.props.darknodeDetails.cycleStatus.keySeq().first()) {
            this.setState({ disableClaim: false });
        }
    }

    public render = (): JSX.Element => {
        const { darknodeDetails, store, isOperator } = this.props;
        const {
            quoteCurrency,
            currentCycle,
            previousCycle,
            pendingRewards,
            pendingTotalInEth,
        } = store;
        const { tab } = this.state;

        const showPreviousPending = darknodeDetails && darknodeDetails.cycleStatus.get(previousCycle) === DarknodeFeeStatus.NOT_CLAIMED;
        const showCurrentPending = darknodeDetails && darknodeDetails.cycleStatus.get(currentCycle) === DarknodeFeeStatus.NOT_CLAIMED;
        let pendingTotal = new BigNumber(0);
        let summedPendingRewards = OrderedMap<Token | OldToken, BigNumber>();
        let summedClaimable = new BigNumber(0);
        if (showPreviousPending) {
            pendingTotal = pendingTotal.plus(pendingTotalInEth.get(previousCycle, new BigNumber(0)));
            summedPendingRewards = pendingRewards.get(previousCycle, OrderedMap());
            summedClaimable = pendingTotal;
        }
        if (showCurrentPending) {
            pendingTotal = pendingTotal.plus(pendingTotalInEth.get(currentCycle, new BigNumber(0)));
            summedPendingRewards = pendingRewards.get(currentCycle, OrderedMap());
        }
        if (showPreviousPending && showCurrentPending) {
            summedPendingRewards = mergeFees(
                pendingRewards.get(previousCycle, OrderedMap()),
                pendingRewards.get(currentCycle, OrderedMap())
            );
        }

        let fees = OrderedMap<Token | OldToken, BigNumber>();
        if (darknodeDetails) {
            fees = tab === Tab.Withdrawable ? darknodeDetails.feesEarned :
                tab === Tab.Pending ? summedPendingRewards :
                    mergeFees(
                        summedPendingRewards,
                        darknodeDetails.feesEarned
                    );
        }

        return (
            <Block
                className="fees-block"
            >
                <BlockTitle>
                    <h3>
                        <RewardsIcon />
                        Darknode Income
                    </h3>
                </BlockTitle>

                {darknodeDetails ? <BlockBody>
                    <Tabs
                        tabs={{
                            Withdrawable: <></>,
                            Pending: <></>,
                        }}
                        onTab={this.setTab}
                    >
                        <div className="block--advanced">
                            <div className="block--advanced--top">
                                <div className="fees-block--total">
                                    <span className="fees-block--advanced--sign">
                                        <CurrencyIcon currency={quoteCurrency} />
                                    </span>
                                    <span className="fees-block--advanced--value">
                                        <TokenBalance
                                            token={Token.ETH}
                                            convertTo={quoteCurrency}
                                            amount={
                                                tab === Tab.Withdrawable ? darknodeDetails.feesEarnedTotalEth :
                                                    pendingTotal
                                            }
                                        />
                                    </span>
                                    <span className="fees-block--advanced--unit">{quoteCurrency.toUpperCase()}</span>
                                </div>
                                <button className="button button--dark"><WithdrawIcon className="icon" />Withdraw</button>
                            </div>
                            <div className="block--advanced--bottom">
                                <table className="fees-block--table">
                                    <thead>
                                        <tr>
                                            <td>Asset</td>
                                            <td>Amount</td>
                                            <td style={{ textAlign: "right", paddingRight: 40 }}>Value</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            fees.toArray().map(([token, balance]: [Token | OldToken, BigNumber], i) => {
                                                return <><tr key={token} style={{}}>
                                                    <td className="fees-block--table--token">
                                                        <TokenIcon className="fees-block--table--icon" white={true} token={token} />
                                                        {" "}
                                                        <span>{token}</span>
                                                    </td>
                                                    <td className="fees-block--table--value">
                                                        <TokenBalance token={token} amount={balance} />
                                                    </td>
                                                    <td className="fees-block--table--usd">
                                                        <CurrencyIcon currency={quoteCurrency} />
                                                        <TokenBalance
                                                            token={token}
                                                            amount={balance}
                                                            convertTo={quoteCurrency}
                                                        />
                                                        {" "}
                                                        <span className="fees-block--table--usd-symbol">
                                                            {quoteCurrency.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    {isOperator ? <td>
                                                        <FeesItem
                                                            disabled={tab !== Tab.Withdrawable}
                                                            key={token}
                                                            token={token}
                                                            amount={balance}
                                                            darknodeID={darknodeDetails.ID}
                                                        />
                                                    </td> : <></>}
                                                </tr>
                                                    <tr>
                                                        <td colSpan={3} style={{ padding: 0, margin: 0, height: 4 }}>
                                                            <div className={classNames("percent-bar", token)} style={{ width: `${Math.max(0, (fees.size - i) / (fees.size) * (40) + Math.sin(3 * i) * 10)}%`, height: 4, marginTop: -6 }} />
                                                        </td>
                                                    </tr>
                                                </>;
                                            })
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Tabs>
                </BlockBody> : null}
            </Block>
        );
    }

    private readonly setTab = (tab: string): void => {
        this.setState({ tab: tab as Tab });
    }
}

const mapStateToProps = (state: ApplicationState) => ({
    store: {
        address: state.account.address,
        web3: state.account.web3,
        quoteCurrency: state.network.quoteCurrency,
        currentCycle: state.network.currentCycle,
        previousCycle: state.network.previousCycle,
        pendingRewards: state.network.pendingRewards,
        pendingTotalInEth: state.network.pendingTotalInEth,
        tokenPrices: state.network.tokenPrices,
        renNetwork: state.account.renNetwork,
        cycleTimeout: state.network.cycleTimeout,
    },
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    actions: bindActionCreators({
        // showClaimPopup,
        updateDarknodeDetails,
        updateCycleAndPendingRewards,
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
    isOperator: boolean;
    darknodeDetails: DarknodesState | null;
}

type State = typeof defaultState;

export const FeesBlock = connect(mapStateToProps, mapDispatchToProps)(FeesBlockClass);
