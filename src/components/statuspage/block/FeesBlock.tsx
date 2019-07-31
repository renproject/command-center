import * as React from "react";

import { faStar } from "@fortawesome/free-regular-svg-icons";
import { faChevronRight, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CurrencyIcon, Loading, TokenIcon } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { OrderedMap } from "immutable";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators } from "redux";

import { DarknodeFeeStatus, RegistrationStatus } from "../../../lib/ethereum/contractReads";
import { OldToken, Token } from "../../../lib/ethereum/tokens";
import { alreadyPast, naturalTime } from "../../../lib/general/conversion";
import { showClaimPopup } from "../../../store/account/operatorPopupActions";
import { ApplicationState, DarknodesState } from "../../../store/applicationState";
import {
    updateCycleAndPendingRewards, updateDarknodeDetails,
} from "../../../store/network/operatorActions";
import { AppDispatch } from "../../../store/rootReducer";
import { TokenBalance } from "../../TokenBalance";
import { FeesItem } from "../FeesItem";
import { OldFees } from "../OldFees";
import { Block, BlockBody, BlockTitle } from "./Block";

enum Tab {
    Withdrawable = "Withdrawable",
    Pending = "Pending",
    Total = "Total",
}

const mergeFees = (left: OrderedMap<Token | OldToken, BigNumber>, right: OrderedMap<Token | OldToken, BigNumber>) => {
    let newFees = OrderedMap<Token | OldToken, BigNumber>();
    for (const token of left.keySeq().concat(right.keySeq()).toArray()) {
        newFees = newFees.set(token, new BigNumber(0).plus(left.get(token, new BigNumber(0)).plus(right.get(token, new BigNumber(0)))));
    }
    return newFees;
};

const defaultState = { // Entries must be immutable
    showAdvanced: false,
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
            // console.log(`Status for ${nextProps.store.previousCycle}: ${nextProps.darknodeDetails.cycleStatus.get(nextProps.store.previousCycle)}`);
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
            cycleTimeout,
        } = store;
        const { showAdvanced, tab, disableClaim, claiming } = this.state;

        const showWhitelist = darknodeDetails && darknodeDetails.cycleStatus.get(currentCycle) === DarknodeFeeStatus.NOT_WHITELISTED;
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
                className={`fees-block ${showAdvanced ? "" : "basic"}`}
                onClick={showAdvanced ? undefined : this.toggleAdvanced}
            >

                {showAdvanced ? <div role="button" className="block--basic--hide" onClick={this.toggleAdvanced}>
                    <FontAwesomeIcon icon={faTimes} pull="left" />
                </div> : null}

                <BlockTitle>
                    <h3>
                        <FontAwesomeIcon icon={faStar} pull="left" />
                        Darknode Income
                    </h3>
                </BlockTitle>

                {darknodeDetails ? <BlockBody>
                    {!showAdvanced ?
                        <div className="block--basic">
                            <div className="block--basic--top">
                                <span className="fees-block--basic--sign">
                                    <CurrencyIcon currency={quoteCurrency} />
                                </span>
                                <span className="fees-block--basic--value">
                                    <TokenBalance
                                        token={Token.ETH}
                                        convertTo={quoteCurrency}
                                        amount={darknodeDetails.feesEarnedTotalEth}
                                    />
                                </span>
                                <span className="fees-block--basic--unit">{quoteCurrency.toUpperCase()}</span>
                            </div>
                            <div className="block--basic--pending">
                                <span className="fees-block--basic--sign">
                                    <CurrencyIcon currency={quoteCurrency} />
                                </span>
                                <span className="fees-block--basic--value">
                                    <TokenBalance
                                        token={Token.ETH}
                                        convertTo={quoteCurrency}
                                        amount={pendingTotal}
                                    />
                                </span>
                                <span className="fees-block--basic--unit">{quoteCurrency.toUpperCase()}</span>
                            </div>
                            <div role="button" className="block--basic--show" onClick={this.toggleAdvanced}>
                                <FontAwesomeIcon icon={faChevronRight} pull="left" />
                            </div>
                        </div> :
                        <div className="block--advanced">
                            <div className="block--advanced--tabs">
                                <input onClick={this.handleInput} name="tab" className={`block--advanced--tab ${tab === "Withdrawable" ? "selected" : ""}`} type="button" value="Withdrawable" />
                                <input onClick={this.handleInput} name="tab" className={`block--advanced--tab ${tab === "Pending" ? "selected" : ""}`} type="button" value="Pending" />
                                <input onClick={this.handleInput} name="tab" className={`block--advanced--tab ${tab === "Total" ? "selected" : ""}`} type="button" value="Total" />
                            </div>

                            <div className="block--advanced--top">
                                <span className="fees-block--advanced--sign">
                                    <CurrencyIcon currency={quoteCurrency} />
                                </span>
                                <span className="fees-block--advanced--value">
                                    <TokenBalance
                                        token={Token.ETH}
                                        convertTo={quoteCurrency}
                                        amount={
                                            tab === Tab.Withdrawable ? darknodeDetails.feesEarnedTotalEth :
                                                tab === Tab.Pending ? pendingTotal :
                                                    darknodeDetails.feesEarnedTotalEth.plus(pendingTotal)
                                        }
                                    />
                                </span>
                                <span className="fees-block--advanced--unit">{quoteCurrency.toUpperCase()}</span>
                            </div>
                            {isOperator && darknodeDetails.registrationStatus === RegistrationStatus.Registered ?
                                cycleTimeout.isZero() || claiming || disableClaim ? <button className="button--white block--advanced--claim" disabled={true}>
                                    <Loading alt={true} />
                                </button> :
                                    (showPreviousPending || showWhitelist) ?
                                        <button className="button--white block--advanced--claim" onClick={this.onClaimBeforeCycle}>
                                            {showWhitelist ? "Whitelist now" : <>
                                                Claim{" "}<CurrencyIcon currency={quoteCurrency} />
                                                <TokenBalance
                                                    token={Token.ETH}
                                                    convertTo={quoteCurrency}
                                                    amount={
                                                        summedClaimable
                                                    }
                                                />{" "}{quoteCurrency.toUpperCase()}{" "}now
                                        </>}
                                        </button> :
                                        alreadyPast(cycleTimeout.toNumber() + 5) ?
                                            <button className="button--white block--advanced--claim" onClick={this.onClaimAfterCycle}>
                                                {showWhitelist ? "Whitelist now" : <>
                                                    Claim pending rewards now
                                            </>}
                                            </button> :
                                            <button className="button--white block--advanced--claim" disabled={true}>
                                                {naturalTime(cycleTimeout.toNumber() + 5, {
                                                    message: "Refresh page to claim pending rewards",
                                                    prefix: "Claim again in",
                                                    countDown: true,
                                                    showingSeconds: true,
                                                })}
                                            </button>
                                : <></>
                            }
                            <div className="block--advanced--bottom scrollable">
                                <table className="fees-block--table">
                                    <tbody>
                                        {
                                            fees.map((balance: BigNumber, token: Token | OldToken) => {
                                                return <tr key={token}>
                                                    <td>
                                                        <TokenIcon className="fees-block--table--icon" token={token} />
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
                                                            disabled={tab === Tab.Withdrawable}
                                                            key={token}
                                                            token={token}
                                                            amount={balance}
                                                            darknodeID={darknodeDetails.ID}
                                                        />
                                                    </td> : <></>}
                                                </tr>;
                                            }).valueSeq().toArray()
                                        }
                                        {
                                            tab !== Tab.Pending ? <OldFees darknodeDetails={darknodeDetails} isOperator={isOperator} /> : <></>
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    }

                </BlockBody> : null}
            </Block>
        );
    }

    private readonly handleInput = (event: React.FormEvent<HTMLInputElement>): void => {
        const element = (event.target as HTMLInputElement);
        this.setState((current: State) => ({ ...current, [element.name]: element.value }));
    }

    private readonly toggleAdvanced = (): void => {
        this.setState({ showAdvanced: !this.state.showAdvanced });
    }

    private readonly onClaimAfterCycle = async () => {
        await this.onClaim(false);
    }

    private readonly onClaimBeforeCycle = async () => {
        await this.onClaim(true);
    }

    private readonly onClaim = async (claimBeforeCycle: boolean) => {
        const { darknodeDetails, store: { web3, address, tokenPrices, renNetwork } } = this.props;

        if (!address || !darknodeDetails) {
            this.setState({ claiming: false });
            return;
        }

        const darknodeID = darknodeDetails.ID;

        const onCancel = () => {
            if (this._isMounted) {
                this.setState({ claiming: false, disableClaim: false });
            }
        };

        const onDone = async () => {
            try {
                await this.props.actions.updateCycleAndPendingRewards(web3, renNetwork, tokenPrices);
                await this.props.actions.updateDarknodeDetails(web3, renNetwork, darknodeID, tokenPrices);
            } catch (error) {
                // Ignore error
            }

            if (this._isMounted) {
                this.setState({ claiming: false });
            }
        };

        const title = `Claim rewards`;
        this.setState({ disableClaim: true });
        await this.props.actions.showClaimPopup(web3, renNetwork, claimBeforeCycle, address, darknodeID, title, onCancel, onDone);
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
        showClaimPopup,
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
