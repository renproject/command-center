import * as React from "react";

import { faFire } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BigNumber from "bignumber.js";

import { DarknodesState } from "../../../../store/applicationState";
import { TopUpController } from "../topup/TopUpController";
import { Block, BlockTitle } from "./Block";

const defaultState = { // Entries must be immutable
    // showAdvanced: false,
};

export class GasBlock extends React.Component<Props, typeof defaultState> {

    public constructor(props: Props, context: object) {
        super(props, context);
        this.state = defaultState;
    }

    public render = (): JSX.Element => {
        const { darknodeDetails } = this.props;
        // const { showAdvanced } = this.state;

        const gasValue = darknodeDetails ?
            (darknodeDetails.ethBalance.div(new BigNumber(Math.pow(10, 18)))).toFixed(3) :
            "";

        return (

            <Block
                // className={`gas-block ${showAdvanced ? "" : "basic"}`}
                className={`gas-block`}
            // onClick={showAdvanced ? undefined : this.toggleAdvanced}
            >
                <BlockTitle>
                    <h3>
                        <FontAwesomeIcon icon={faFire} pull="left" />
                        Gas Balance
                    </h3>
                </BlockTitle>

                {darknodeDetails ?
                    <div className="block--advanced">
                        <div className="block--advanced--top">
                            <span className="gas-block--advanced--value">{gasValue}</span>
                            <span className="gas-block--advanced--unit">ETH</span>
                        </div>
                        <div className="block--advanced--bottom">
                            <TopUpController darknodeID={darknodeDetails.ID} />
                        </div>
                    </div>
                    : null}
            </Block>
        );
    }

    // private readonly toggleAdvanced = (): void => {
    //     this.setState({ showAdvanced: !this.state.showAdvanced });
    // }

}

interface Props {
    darknodeDetails: DarknodesState | null;
}
