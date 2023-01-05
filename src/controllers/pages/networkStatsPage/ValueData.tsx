import BigNumber from "bignumber.js";
import React from "react";

import { CurrencyIcon, Loading } from "@renproject/react-components";

import { getFirstAndLastSnapshot, getSnapshots, SnapshotRecords } from "../../../lib/graphQL/queries/renVmTracker";
import { PeriodOption } from "../../../lib/graphQL/volumes";
import { NetworkContainer } from "../../../store/networkContainer";
import { ReactComponent as IconValueLocked } from "../../../styles/images/icon-value-locked.svg";
import { Stat } from "../../../views/Stat";
import { ChainOption } from "./ChainSelector";

export const getPeriodPercentChange = <K extends string>(
    periodType: PeriodOption,
    property: K,
    seriesData?: Array<{ [key in K]?: string }> | undefined,
) => {
    if (
        periodType !== PeriodOption.ALL &&
        seriesData &&
        seriesData.length > 1
    ) {
        const historic = seriesData;
        const prev = historic[0];
        const curr = historic[historic.length - 1];
        return new BigNumber((curr[property] || "0") as string)
            .minus((prev[property] || "0") as string)
            .dividedBy((curr[property] || "0") as string)
            .multipliedBy(100);
    }
    return null;
};

export const updateVolumeData = (
    oldData: SnapshotRecords | undefined,
    updateData: SnapshotRecords,
) => {
    if (!oldData) {
        return updateData;
    }
    const newSnapshot = Object.values(updateData)[0];
    const snapshots = getSnapshots(oldData);
    const { last } = getFirstAndLastSnapshot(snapshots);

    // Replace last snapshot with new snapshot, to avoid the volume graphs
    // stretching at the far-right of the graphs.
    const newData = {
        ...oldData,
        [`s${newSnapshot.timestamp}`]: newSnapshot,
    };
    if (newSnapshot.timestamp !== last.timestamp) {
        delete newData[`s${last.timestamp}`];
    }

    return newData;
};

type VolumeStatsProps = {
    chainOption: ChainOption;
};

export const ValueStats: React.FC<VolumeStatsProps> = ({
    chainOption,
}) => {
    const volumeLoading = false;
    const volumeError = false;
    const { quoteCurrency, tokenPrices } = NetworkContainer.useContainer();

    console.log("r: tokenPrices", tokenPrices);

    const volumePeriodTotal = "42";
    return (
        <div className="stat-with-period">
            <Stat
                message={
                    <>
                        {"Total Value Locked"}{" "}
                        <span className="stat--subtitle">
                            {chainOption === ChainOption.All ? "All Chains" : chainOption}
                        </span>
                    </>
                }
                icon={
                    <IconValueLocked />
                }
                big={true}
                infoLabel={<>Total value currently locked on {chainOption === ChainOption.All ? "all chains" : chainOption}</>}
                className="stat--extra-big"
            >
                {!volumeLoading ? (
                    <div>
                        <span className="stat-amount">
                            <CurrencyIcon currency={quoteCurrency} />
                            <span className="stat-amount--value">
                                {volumePeriodTotal ? (
                                    <>
                                        {new BigNumber(
                                            volumePeriodTotal,
                                        ).toFormat(2)}
                                    </>
                                ) : (
                                    "..."
                                )}
                            </span>
                        </span>
                    </div>
                ) : !volumeError ? (
                    <Loading alt />
                ) : null}
                <div className="overview--bottom">
                    <>
                        {volumeError ? (
                            <div className="volume--error">
                                Unable to fetch data
                            </div>
                        ) : volumeLoading ? (
                            <Loading alt={true} />
                        ): <span>Chart</span>}
                    </>
                </div>
            </Stat>
        </div>
    );
};
