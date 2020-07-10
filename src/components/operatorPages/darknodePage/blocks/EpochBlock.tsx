import "react-circular-progressbar/dist/styles.css";

import { faServer } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import { naturalTime } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import React, { useEffect, useState } from "react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";

import { isDefined } from "../../../../lib/general/isDefined";
import { GraphContainer } from "../../../../store/graphStore";
import { DarknodesState } from "../../../../store/networkContainer";
import { SECONDS } from "../../../common/BackgroundTasks";
import { Block, BlockBody, BlockTitle } from "./Block";

interface Props {
    darknodeDetails: DarknodesState | null;
}

export const EpochBlock: React.FC<Props> = ({ darknodeDetails }) => {

    const { renVM } = GraphContainer.useContainer();
    const { timeUntilNextEpoch, timeSinceLastEpoch, minimumEpochInterval } = renVM || {};

    const [currentTime, setCurrentTime] = useState<BigNumber | null>(null);
    useEffect(() => {
        setCurrentTime(new BigNumber(new Date().getTime() / SECONDS));
    }, [timeSinceLastEpoch]);

    return (

        <Block className="epoch-block">
            <BlockTitle>
                <h3>
                    <FontAwesomeIcon icon={faServer as FontAwesomeIconProps["icon"]} pull="left" />
                    Next Epoch
                </h3>
            </BlockTitle>

            {darknodeDetails ? <BlockBody>
                <div className="epoch--block--charts">
                    <div className="resources--chart--and--label">
                        <div className="epoch-chart">
                            <CircularProgressbar
                                value={BigNumber.min((timeSinceLastEpoch || new BigNumber(0)).div(minimumEpochInterval || new BigNumber(1)).times(100), 100).toNumber()}
                                text={isDefined(currentTime) && isDefined(timeUntilNextEpoch) ? naturalTime(timeUntilNextEpoch.plus(currentTime).toNumber(), {
                                    suffix: "",
                                    message: "",
                                    countDown: true,
                                    showingSeconds: false
                                }) : ""}
                                styles={buildStyles({
                                    // Text size
                                    textSize: "16px",

                                    // How long animation takes to go from one percentage to another, in seconds
                                    pathTransitionDuration: 0.5,

                                    // Can specify path transition in more detail, or remove it entirely
                                    // pathTransition: 'none',

                                    // Colors
                                    pathColor: `#006FE8`,
                                    textColor: "#fff",
                                    trailColor: "#173453",
                                })}
                            />

                        </div>
                    </div>
                    <div className="epoch-right">
                        {/* <p>Epochs are currently called manually</p> */}
                        <p>{isDefined(currentTime) && isDefined(timeUntilNextEpoch) ? naturalTime(currentTime.plus(timeUntilNextEpoch).toNumber(), {
                            suffix: "until next epoch",
                            message: "New epoch will be called shortly",
                            countDown: true,
                            showingSeconds: false
                        }) : ""}</p>
                        <p>{isDefined(currentTime) && isDefined(timeSinceLastEpoch) ? naturalTime(currentTime.minus(timeSinceLastEpoch).toNumber(), {
                            suffix: "since last epoch",
                            message: "Epoch called just now",
                            countDown: false,
                            showingSeconds: false
                        }) : ""}</p>
                    </div>
                </div>
            </BlockBody> : null}
        </Block>
    );
};
