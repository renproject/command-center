import * as React from "react";

import BigNumber from "bignumber.js";

import { DarknodesState, NetworkContainer } from "../../../store/networkContainer";
import { ReactComponent as FlameIcon } from "../../../styles/images/icon-flame.svg";
import { TopUpController } from "../topup/TopUpController";
import { Block, BlockTitle } from "./Block";

interface Props {
    darknodeDetails: DarknodesState | null;
}

export const GasBlock: React.FC<Props> = ({ darknodeDetails }) => {

    const gasValue = darknodeDetails && darknodeDetails.ethBalance ?
        (darknodeDetails.ethBalance.div(new BigNumber(Math.pow(10, 18)))).toFixed(3) :
        null;

    const { updateDarknodeDetails } = NetworkContainer.useContainer();

    const [loading, setLoading] = React.useState(false);

    const darknodeID = darknodeDetails && darknodeDetails.ID;

    const reloadDetails = React.useCallback(async (): Promise<void> => {
        setLoading(true);
        try {
            if (darknodeID) {
                await updateDarknodeDetails(darknodeID);
            }
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    }, [updateDarknodeDetails, darknodeID]);

    return (

        <Block
            // className={`gas-block ${showAdvanced ? "" : "basic"}`}
            className={`gas-block`}
        // onClick={showAdvanced ? undefined : this.toggleAdvanced}
        >
            <BlockTitle>
                <h3>
                    <FlameIcon />
                    Gas Balance
                    </h3>
            </BlockTitle>

            {darknodeDetails ?
                <div className="block--advanced">
                    <div className="block--advanced--top">
                        {gasValue ? <>
                            <span className="gas-block--advanced--value">{gasValue}</span>
                            <span className="gas-block--advanced--unit">ETH</span>
                        </> : <>Unable to load. <button className="text-button" disabled={loading} onClick={reloadDetails}>Reload</button></>}
                    </div>
                    <div className="block--advanced--bottom">
                        <TopUpController darknodeID={darknodeDetails.ID} />
                    </div>
                </div>
                : null}
        </Block>
    );
};
