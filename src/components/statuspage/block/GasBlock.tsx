import * as React from "react";

import BigNumber from "bignumber.js";

import { faChevronRight, faFire, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { CurrencyIcon } from "../../../components/CurrencyIcon";
import { Currency, DarknodeDetails } from "../../../reducers/types";
import { TopUp } from "../TopUp";
import { Block, BlockBody, BlockTitle } from "./Block";

export class GasBlock extends React.Component<Props, State> {

    public constructor(props: Props, context: object) {
        super(props, context);
        this.state = {
            showAdvanced: false,
        };
    }

    public render = (): JSX.Element => {
        const { darknodeDetails } = this.props;
        const { showAdvanced } = this.state;

        const gasValue = darknodeDetails ?
            (darknodeDetails.ethBalance.div(new BigNumber(Math.pow(10, 18)))).toFixed(3) :
            "";

        return (

            <Block
                className={`gas-block ${showAdvanced ? "" : "basic"}`}
                onClick={showAdvanced ? undefined : this.toggleAdvanced}
            >
                {showAdvanced ? <div role="button" className="block--basic--hide" onClick={this.toggleAdvanced}>
                    <FontAwesomeIcon icon={faTimes} pull="left" />
                </div> : null}

                <BlockTitle>
                    <h3>
                        <FontAwesomeIcon icon={faFire} pull="left" />
                        Gas Balance
                    </h3>
                </BlockTitle>

                {darknodeDetails ? <BlockBody>
                    {!showAdvanced ?
                        <div className="block--basic">
                            <div className="block--basic--top">
                                <span className="gas-block--basic--sign"><CurrencyIcon currency={Currency.ETH} /></span>
                                <span className="gas-block--basic--value">{gasValue}</span>
                                <span className="gas-block--basic--unit">ETH</span>
                            </div>
                            <div className="block--basic--show">
                                <FontAwesomeIcon icon={faChevronRight} pull="left" />
                            </div>
                        </div> :
                        <div className="block--advanced">
                            <div className="block--advanced--top">
                                <span className="gas-block--advanced--value">{gasValue}</span>
                                <span className="gas-block--advanced--unit">ETH</span>
                            </div>
                            <div className="block--advanced--bottom">
                                <TopUp darknodeID={darknodeDetails.ID} />
                            </div>
                        </div>
                    }
                </BlockBody> : null}
            </Block>
        );
    }

    private readonly toggleAdvanced = (): void => {
        this.setState({ showAdvanced: !this.state.showAdvanced });
    }

}

interface Props {
    darknodeDetails: DarknodeDetails | null;
}

interface State {
    showAdvanced: boolean;
}
