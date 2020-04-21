import * as React from "react";

import { faFire } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BigNumber from "bignumber.js";

import { DarknodesState } from "../../../../store/networkStateContainer";
import { TopUpController } from "../topup/TopUpController";
import { Block, BlockTitle } from "./Block";

interface Props {
    darknodeDetails: DarknodesState | null;
}

export const GasBlock: React.StatelessComponent<Props> = ({ darknodeDetails }) => {

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
};
