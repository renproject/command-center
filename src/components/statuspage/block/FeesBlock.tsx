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
import { ApplicationData, DarknodeDetails, DarknodeFeeStatus } from "../../../store/types";
import { CurrencyIcon } from "../../CurrencyIcon";
import { TokenBalance } from "../../TokenBalance";
import { FeesItem } from "../FeesItem";
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

    public constructor(props: Props, context: object) {
        super(props, context);
        this.state = {
            showAdvanced: false,
            tab: Tab.Withdrawable,
        };
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

        const showPreviousPending = darknodeDetails && darknodeDetails.cycleStatus.get(previousCycle) === DarknodeFeeStatus.NOT_CLAIMED;
        const showCurrentPending = darknodeDetails && darknodeDetails.cycleStatus.get(currentCycle) === DarknodeFeeStatus.NOT_CLAIMED;
        let pendingTotal = new BigNumber(0);
        let summedPendingRewards = OrderedMap<Token | OldToken, BigNumber>();
        if (showPreviousPending) {
            pendingTotal = pendingTotal.plus(pendingTotalInEth.get(previousCycle, new BigNumber(0)));
            summedPendingRewards = pendingRewards.get(previousCycle, OrderedMap());
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

        const oldFees = [];
        if (darknodeDetails) {
            for (const [token, balance] of darknodeDetails.oldFeesEarned.toArray()) {
                const tokenName = token.replace(" (old)", "");
                if (balance.isZero()) {
                    continue;
                }
                oldFees.push(<tr key={token}>
                    <td>
                        <TokenIcon className="fees-block--table--icon" token={tokenName} />
                        {" "}
                        <span>{tokenName}</span>
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
                            disabled={true}
                            key={token}
                            token={token}
                            amount={balance}
                            darknodeID={darknodeDetails.ID}
                        />
                    </td> : <></>}
                </tr>);
            }
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
                                            tab !== Tab.Pending && oldFees.length > 0 ? <>
                                                <th colSpan={4}>
                                                    Old fees
                                                </th>
                                                {oldFees}
                                            </> : <></>
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

}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        quoteCurrency: state.statistics.quoteCurrency,
        currentCycle: state.statistics.currentCycle,
        previousCycle: state.statistics.previousCycle,
        pendingRewards: state.statistics.pendingRewards,
        pendingTotalInEth: state.statistics.pendingTotalInEth,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
    isOperator: boolean;
    darknodeDetails: DarknodeDetails | null;
}

interface State {
    showAdvanced: boolean;
    tab: Tab;
}

export const FeesBlock = connect(mapStateToProps, mapDispatchToProps)(FeesBlockClass);
