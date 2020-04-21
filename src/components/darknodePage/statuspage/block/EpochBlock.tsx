import "react-circular-progressbar/dist/styles.css";

import * as React from "react";

import { faServer } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";

import { EpochContainer } from "../../../../store/epochStore";
import { DarknodesState } from "../../../../store/networkStateContainer";
import { Block, BlockBody, BlockTitle } from "./Block";

export const EpochBlock = ({ darknodeDetails }: Props): JSX.Element => {

    const { timeUntilNextEpoch, timeSinceLastEpoch, epochInterval } = EpochContainer.useContainer();

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
                                value={Math.min((timeSinceLastEpoch || 0) / (epochInterval || 1), 100)}
                                text={`${Math.floor((timeSinceLastEpoch || 0) / 60 / 60 / 24)} days`}
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
                        <p>{Math.floor((timeUntilNextEpoch || 0) / 60 / 60 / 24)} days until next epoch</p>
                        <p>Ends 00:00 UTC 23rd April, 2020</p>
                    </div>
                </div>
            </BlockBody> : null}
        </Block>
    );
};

// tslint:disable: react-unused-props-and-state
interface Props {
    darknodeDetails: DarknodesState | null;
}
