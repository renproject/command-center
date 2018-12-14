import * as React from "react";

import RenExSDK from "@renex/renex";
import BigNumber from "bignumber.js";

import { faStar } from "@fortawesome/free-regular-svg-icons";
import { faChevronRight, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { ApplicationData, Currency, DarknodeDetails } from "@Reducers/types";
import { Block, BlockBody, BlockTitle } from "./Block";
import { FeesItem } from "./FeesItem";
import { Token } from "./lib/tokens";
import { TokenBalance } from "./TokenBalance";
import { TokenIcon } from "./TokenIcon";


interface FeesBlockProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
    sdk: RenExSDK;
    operator: boolean;
    darknodeDetails: DarknodeDetails | null;
}

interface FeesBlockState {
    showAdvanced: boolean;
}

class FeesBlockClass extends React.Component<FeesBlockProps, FeesBlockState> {

    public constructor(props: FeesBlockProps, context: object) {
        super(props, context);
        this.state = {
            showAdvanced: false,
        };
    }

    public render(): JSX.Element {
        const { sdk, darknodeDetails, store, operator } = this.props;
        const { quoteCurrency } = store;
        const { showAdvanced } = this.state;

        return (
            <Block className="fees-block">
                {showAdvanced ? <div className="block--basic--hide" onClick={this.toggleAdvanced}>
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
                                <span className="fees-block--basic--sign">$</span>
                                <span className="fees-block--basic--value"><TokenBalance token={Token.ETH} convertTo={quoteCurrency} amount={darknodeDetails.feesEarnedTotalEth} /></span>
                                <span className="fees-block--basic--unit">{quoteCurrency.toUpperCase()}</span>
                            </div>
                            <div className="block--basic--show" onClick={this.toggleAdvanced}>
                                <FontAwesomeIcon icon={faChevronRight} pull="left" />
                            </div>
                        </div> :
                        <div className="block--advanced">
                            <div className="block--advanced--top">
                                <span className="fees-block--advanced--sign">$</span>
                                <span className="fees-block--advanced--value"><TokenBalance token={Token.ETH} convertTo={quoteCurrency} amount={darknodeDetails.feesEarnedTotalEth} /></span>
                                <span className="fees-block--advanced--unit">{quoteCurrency.toUpperCase()}</span>
                            </div>

                            <div className="block--advanced--bottom scrollable">
                                <table className="fees-block--table">
                                    <tbody>
                                        {
                                            darknodeDetails.feesEarned.map((balance: BigNumber, token: Token) => {
                                                return <tr key={token}>
                                                    <td><TokenIcon className="fees-block--table--icon" token={token} /> <span>{token}</span></td>
                                                    <td className="fees-block--table--value"><TokenBalance token={token} amount={balance} /></td>
                                                    <td className="fees-block--table--usd">$<TokenBalance token={token} amount={balance} convertTo={quoteCurrency} /> <span className="fees-block--table--usd-symbol">{quoteCurrency.toUpperCase()}</span></td>
                                                    <td><FeesItem operator={operator} key={token} sdk={sdk} token={token} amount={balance} darknodeAddress={darknodeDetails.ID} /></td>
                                                </tr>;
                                            }).valueSeq().toArray()
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

    private toggleAdvanced = () => {
        this.setState({ showAdvanced: !this.state.showAdvanced });
    }

}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        quoteCurrency: state.statistics.quoteCurrency,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
    }, dispatch),
});

export const FeesBlock = connect(mapStateToProps, mapDispatchToProps)(FeesBlockClass);

