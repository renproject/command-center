import "react-circular-progressbar/dist/styles.css";

import * as React from "react";

import { faServer } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { naturalTime } from "@renproject/react-components";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";

import { EpochContainer } from "../../../store/epochStore";
import { DarknodesState } from "../../../store/networkStateContainer";
import { Block, BlockBody, BlockTitle } from "./Block";

interface Props {
    darknodeDetails: DarknodesState | null;
}

export const EpochBlock: React.FC<Props> = ({ darknodeDetails }) => {

    const { timeUntilNextEpoch, timeSinceLastEpoch, epochInterval } = EpochContainer.useContainer();

    const [currentTime, setCurrentTime] = React.useState<number | null>(null);
    React.useEffect(() => {
        setCurrentTime(new Date().getTime() / 1000);
    }, [timeSinceLastEpoch]);

    return (

        <Block className="epoch-block">
            <BlockTitle>
                <h3>
                    <FontAwesomeIcon icon={faServer} pull="left" />
                    Next Epoch
                </h3>
            </BlockTitle>

            {darknodeDetails ? <BlockBody>
                <div className="epoch--block--charts">
                    <div className="resources--chart--and--label">
                        <div className="epoch-chart">
                            <CircularProgressbar
                                value={Math.min((timeSinceLastEpoch || 0) / (epochInterval || 1) * 100, 100)}
                                text={currentTime !== null && timeUntilNextEpoch !== null ? naturalTime(currentTime + timeUntilNextEpoch, {
                                    suffix: "",
                                    message: "",
                                    countDown: true,
                                    showingSeconds: false
                                }) : ""}
                                // value={100}
                                // text={currentTime !== null && timeSinceLastEpoch !== null ? naturalTime(currentTime - timeSinceLastEpoch, {
                                //     suffix: "",
                                //     message: "",
                                //     countDown: false,
                                //     showingSeconds: false
                                // }) : ""}
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
                        <p>{currentTime !== null && timeUntilNextEpoch !== null ? naturalTime(currentTime + timeUntilNextEpoch, {
                            suffix: "until next epoch",
                            message: "New epoch will be called shortly",
                            countDown: true,
                            showingSeconds: false
                        }) : ""}</p>
                        <p>{currentTime !== null && timeSinceLastEpoch !== null ? naturalTime(currentTime - timeSinceLastEpoch, {
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
