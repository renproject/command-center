import * as React from "react";

import RenExSDK from "@renex/renex";

import { faChevronRight, faFire, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { ApplicationData, DarknodeDetails } from "@Reducers/types";
import BigNumber from "bignumber.js";
import { Block, BlockBody, BlockTitle } from "./Block";
import { Token } from "./lib/tokens";
import { TokenBalance } from "./TokenBalance";
import { Topup } from "./Topup";

interface StoreProps {
}

interface GasBlockProps extends StoreProps {
    sdk: RenExSDK;
    darknodeDetails: DarknodeDetails;

    actions: {
    };
}

interface GasBlockState {
    showAdvanced: boolean;
}

class GasBlockClass extends React.Component<GasBlockProps, GasBlockState> {

    public constructor(props: GasBlockProps, context: object) {
        super(props, context);
        this.state = {
            showAdvanced: false,
        };
    }

    public render(): JSX.Element {
        const { sdk, darknodeDetails } = this.props;
        const { showAdvanced } = this.state;

        const gasValueInWei = darknodeDetails.ethBalance.toString();
        const gasValue = (new BigNumber(gasValueInWei).div(new BigNumber(Math.pow(10, 18)))).toFixed(3);

        return (

            <Block className="gas-block">
                {showAdvanced ? <div className="block--basic--hide" onClick={this.toggleAdvanced}>
                    <FontAwesomeIcon icon={faTimes} pull="left" />
                </div> : null}

                <BlockTitle>
                    <h3>
                        <FontAwesomeIcon icon={faFire} pull="left" />
                        Gas Balance
                    </h3>
                </BlockTitle>

                <BlockBody>

                    {!showAdvanced ?
                        <div className="block--basic">
                            <div className="block--basic--top">
                                <span className="gas-block--basic--value">{gasValue}</span>
                                <span className="gas-block--basic--unit">ETH</span>
                            </div>
                            <div className="block--basic--show" onClick={this.toggleAdvanced}>
                                <FontAwesomeIcon icon={faChevronRight} pull="left" />
                            </div>
                        </div> :
                        <div className="block--advanced">
                            <div className="block--advanced--top">
                                <span className="gas-block--advanced--value">{gasValue}</span>
                                <span className="gas-block--advanced--unit">ETH</span>
                            </div>
                            <div className="block--advanced--bottom">
                                <p>Top-up Balance</p>
                                <Topup web3={sdk.getWeb3()} darknodeAddress={darknodeDetails.ID} />
                            </div>
                        </div>
                    }
                </BlockBody>
            </Block>
        );
    }

    private toggleAdvanced = () => {
        this.setState({ showAdvanced: !this.state.showAdvanced });
    }

}

function mapStateToProps(state: ApplicationData): StoreProps {
    return {
    };
}

function mapDispatchToProps(dispatch: Dispatch): { actions: GasBlockProps["actions"] } {
    return {
        actions: bindActionCreators({
        }, dispatch)
    };
}

export const GasBlock = connect(mapStateToProps, mapDispatchToProps)(GasBlockClass);

