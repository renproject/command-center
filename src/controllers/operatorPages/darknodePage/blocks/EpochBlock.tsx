import { faServer } from "@fortawesome/free-solid-svg-icons";
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import BigNumber from "bignumber.js";
import React from "react";

import { EpochProgress } from "../../../../views/EpochProgress";
import { Block, BlockBody, BlockTitle } from "./Block";

interface Props {
  timeUntilNextEpoch: BigNumber | undefined;
  timeSinceLastEpoch: BigNumber | undefined;
  minimumEpochInterval: BigNumber | undefined;
}

export const EpochBlock: React.FC<Props> = ({
  timeUntilNextEpoch,
  timeSinceLastEpoch,
  minimumEpochInterval,
}) => (
  <Block className="epoch-block">
    <BlockTitle>
      <h3>
        <FontAwesomeIcon
          icon={faServer as FontAwesomeIconProps["icon"]}
          pull="left"
        />
        Next Epoch
      </h3>
    </BlockTitle>

    <BlockBody>
      <EpochProgress
        timeSinceLastEpoch={timeSinceLastEpoch}
        timeUntilNextEpoch={timeUntilNextEpoch}
        minimumEpochInterval={minimumEpochInterval}
      />
    </BlockBody>
  </Block>
);
