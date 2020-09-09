import "react-circular-progressbar/dist/styles.css";

import { naturalTime } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";

import { SECONDS } from "../controllers/common/BackgroundTasks";
import { isDefined } from "../lib/general/isDefined";
import { classNames } from "../lib/react/className";

interface Props {
  timeSinceLastEpoch: BigNumber | undefined;
  timeUntilNextEpoch: BigNumber | undefined;
  minimumEpochInterval: BigNumber | undefined;

  small?: boolean;
}

export const EpochProgress: React.FC<Props> = ({
  timeSinceLastEpoch,
  timeUntilNextEpoch,
  minimumEpochInterval,
  small,
}) => {
  const [currentTime, setCurrentTime] = useState<BigNumber | null>(null);
  useEffect(() => {
    setCurrentTime(new BigNumber(new Date().getTime() / SECONDS));
  }, [timeSinceLastEpoch]);

  return (
    <div
      className={classNames(
        "epoch--block--charts",
        small ? "epoch--block--charts--small" : null
      )}
    >
      <div className="resources--chart--and--label">
        <div className={small ? "epoch-chart--small" : "epoch-chart"}>
          <CircularProgressbar
            value={BigNumber.min(
              (timeSinceLastEpoch || new BigNumber(0))
                .div(minimumEpochInterval || new BigNumber(1))
                .times(100),
              100
            ).toNumber()}
            text={
              isDefined(currentTime) && isDefined(timeUntilNextEpoch)
                ? naturalTime(currentTime.plus(timeUntilNextEpoch).toNumber(), {
                    suffix: "",
                    message: "",
                    countDown: true,
                    showingSeconds: false,
                  })
                : ""
            }
            styles={buildStyles({
              // Text size
              textSize: "16px",

              // How long animation takes to go from one percentage to another, in seconds
              pathTransitionDuration: 0.5,

              // Colors
              pathColor: `#006FE8`,
              textColor: "#fff",
              trailColor: "#173453",
            })}
          />
        </div>
      </div>
      <div className="epoch-right">
        {isDefined(currentTime) && isDefined(timeUntilNextEpoch) && (
          <>
            <p>
              {naturalTime(currentTime.plus(timeUntilNextEpoch).toNumber(), {
                suffix: "until next epoch",
                message: "New epoch will be called shortly",
                countDown: true,
                showingSeconds: false,
              })}
            </p>
            {timeUntilNextEpoch.gt(0) && (
              <p className="epoch--end-date">
                Ends{" "}
                {moment
                  .unix(currentTime.plus(timeUntilNextEpoch).toNumber())
                  .utc()
                  .format("HH:mm Do MMMM, YYYY [UTC]")}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};
