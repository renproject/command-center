import * as React from "react";

import BigNumber from "bignumber.js";

import { faStar } from "@fortawesome/free-regular-svg-icons";
import { faChevronRight, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TokenIcon } from "@renex/react-components";
import { OrderedMap } from "immutable";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators, Dispatch } from "redux";

import { OldToken, Token } from "../../../lib/ethereum/tokens";
import { RegistrationStatus, updateDarknodeStatistics } from "../../../store/actions/statistics/operatorActions";
import { showClaimPopup } from "../../../store/actions/statistics/operatorPopupActions";
import { ApplicationData, DarknodeDetails, DarknodeFeeStatus } from "../../../store/types";
import { CurrencyIcon } from "../../CurrencyIcon";
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

class FeesBlockClass extends React.Component<Props, State> {
    private _isMounted = false;

    public constructor(props: Props, context: object) {
        super(props, context);
        this.state = {
            showAdvanced: false,
            tab: Tab.Withdrawable,
            claiming: false,
        };
    }

    public componentDidMount = async () => {
        this._isMounted = true;
    }

    public componentWillUnmount = () => {
        this._isMounted = false;
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
        const { showAdvanced, tab } = this.state;

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
                            {darknodeDetails.registrationStatus === RegistrationStatus.Registered && (showPreviousPending || showWhitelist) ? <>
                                <button className="button--white block--advanced--claim" onClick={this.onClaim}>
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
                                </button>
                            </> : <></>
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

    private readonly onClaim = async () => {
        const { darknodeDetails, store: { web3, address, tokenPrices, ethNetwork } } = this.props;

        if (!address || !darknodeDetails) {
            this.setState({ claiming: false });
            return;
        }

        const darknodeID = darknodeDetails.ID;

        const onCancel = () => {
            if (this._isMounted) {
                this.setState({ claiming: false });
            }
        };

        const onDone = async () => {
            try {
                await this.props.actions.updateDarknodeStatistics(web3, ethNetwork, darknodeID, tokenPrices);
            } catch (error) {
                // Ignore error
            }

            if (this._isMounted) {
                this.setState({ claiming: false });
            }
        };

        const title = `Claim rewards`;
        await this.props.actions.showClaimPopup(web3, ethNetwork, address, darknodeID, title, onCancel, onDone);
    }

}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        address: state.trader.address,
        web3: state.trader.web3,
        quoteCurrency: state.statistics.quoteCurrency,
        currentCycle: state.statistics.currentCycle,
        previousCycle: state.statistics.previousCycle,
        pendingRewards: state.statistics.pendingRewards,
        pendingTotalInEth: state.statistics.pendingTotalInEth,
        tokenPrices: state.statistics.tokenPrices,
        ethNetwork: state.trader.ethNetwork,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        showClaimPopup,
        updateDarknodeStatistics,
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
    isOperator: boolean;
    darknodeDetails: DarknodeDetails | null;
}

interface State {
    showAdvanced: boolean;
    tab: Tab;
    claiming: boolean;
}

export const FeesBlock = connect(mapStateToProps, mapDispatchToProps)(FeesBlockClass);
