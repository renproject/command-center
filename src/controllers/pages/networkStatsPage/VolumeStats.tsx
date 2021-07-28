import { Currency, CurrencyIcon, Loading } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import React, { useEffect, useMemo, useState } from "react";
import { Token } from "../../../lib/ethereum/tokens";
import { GraphClientContainer } from "../../../lib/graphQL/ApolloWithNetwork";
import {
    AmountKind,
    networkStatsChainToTrackerChain,
    queryRenVmTracker,
    snapshotDataToTimeSeries,
    snapshotDataToTokenAmountRecords,
    SnapshotRecord,
    TrackerType,
} from "../../../lib/graphQL/queries/renVmTracker";

import { PeriodType } from "../../../lib/graphQL/volumes";
import { NetworkContainer } from "../../../store/networkContainer";
import { ReactComponent as IconVolume } from "../../../styles/images/icon-volume.svg";
import { Stat } from "../../../views/Stat";
import { convertTokenAmount } from "../../common/tokenBalanceUtils";
import { ChainSelector } from "./ChainSelector";
import { DoughnutChart } from "./DoughnutChart";
import { Graph, Line } from "./Graph";
import { NetworkStatsChain } from "./networkStatsContainer";
import { PeriodSelector } from "./PeriodSelector";
import { StatTab, StatTabs } from "./StatTabs";

export const getPeriodPercentChange = <K extends string>(
    periodType: PeriodType,
    property: K,
    seriesData?: Array<{ [key in K]?: string }> | undefined,
) => {
    if (periodType !== PeriodType.ALL && seriesData && seriesData.length > 1) {
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

export const useVolumeData = (type: TrackerType) => {
    const { renVmTracker } = GraphClientContainer.useContainer();

    const [volumeData, setVolumeData] = useState<SnapshotRecord>({});
    const [volumeLoading, setVolumeLoading] = useState(true);
    const [volumePeriod, setVolumePeriod] = useState<PeriodType>(
        PeriodType.ALL,
    );

    useEffect(() => {
        setVolumeLoading(true);
        queryRenVmTracker(renVmTracker, type, volumePeriod)
            .then((response) => {
                setVolumeData(response.data);
                setVolumeLoading(false);
            })
            .catch(console.error);
    }, [volumePeriod, type]);

    return {
        volumeData,
        volumeLoading,
        volumePeriod,
        setVolumePeriod,
    };
};

type VolumeStatsProps = {
    trackerType?: TrackerType;
};

export const VolumeStats: React.FC<VolumeStatsProps> = ({
    trackerType = TrackerType.Volume,
}) => {
    const { quoteCurrency, tokenPrices } = NetworkContainer.useContainer();
    console.log("tp", tokenPrices?.toJS());
    const {
        volumeData,
        volumeLoading,
        volumePeriod,
        setVolumePeriod,
    } = useVolumeData(trackerType);

    const [volumeSelectedChain, setVolumeSelectedChain] = useState(
        NetworkStatsChain.Ethereum,
    );
    const [volumeTab, setVolumeTab] = useState<StatTab>(StatTab.History);
    const volumeChain = networkStatsChainToTrackerChain(volumeSelectedChain);

    const doughnutData = useMemo(() => {
        if (volumeLoading || !volumeData) {
            return {};
        }
        console.log("tokenPrices", tokenPrices?.toJS());
        if (quoteCurrency === Currency.USD || tokenPrices === null) {
            return snapshotDataToTokenAmountRecords(
                volumeData,
                trackerType,
                volumeChain,
                AmountKind.Usd,
            );
        }
        const amountRecords = snapshotDataToTokenAmountRecords(
            volumeData,
            trackerType,
            volumeChain,
            AmountKind.Token,
        );
        console.log("here");
        return Object.fromEntries(
            Object.entries(amountRecords).map(([asset, amount]) => [
                asset,
                convertTokenAmount(
                    amount,
                    asset as Token,
                    quoteCurrency,
                    tokenPrices,
                ),
            ]),
        );
    }, [volumeLoading, volumeData, volumeChain, quoteCurrency, tokenPrices]);
    console.log("dh", doughnutData);

    const linesData = useMemo(() => {
        const series = snapshotDataToTimeSeries(
            volumeData,
            trackerType,
            volumeChain,
            AmountKind.Usd,
        );
        console.log("series", series);

        const line: Line = {
            name: `Accumulative Volume (${quoteCurrency.toUpperCase()})`,
            axis: 0,
            data: series,
        };
        return [line];
    }, [quoteCurrency, volumeData, trackerType, volumeChain]);

    console.log("ld", linesData);
    const volumePeriodTotal = new BigNumber(42);
    return (
        <div className="stat-with-period">
            <PeriodSelector
                selected={volumePeriod}
                onChange={setVolumePeriod}
            />
            <Stat
                message={
                    <>
                        Volume{" "}
                        <span className="stat--subtitle">
                            (
                            {volumePeriod === PeriodType.ALL
                                ? volumePeriod
                                : `1${volumePeriod.slice(0, 1).toUpperCase()}`}
                            )
                        </span>
                    </>
                }
                icon={<IconVolume />}
                big={true}
                infoLabel={<>Total amount of volume transacted via RenVM.</>}
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
                ) : (
                    <Loading alt />
                )}
                <div className="overview--bottom">
                    <div className="overview--select-chain">
                        <ChainSelector
                            selected={volumeSelectedChain}
                            onChange={setVolumeSelectedChain}
                        />
                    </div>
                    <StatTabs
                        selected={volumeTab}
                        onChange={setVolumeTab}
                        volumePeriod={volumePeriod}
                        assetsPeriod={volumePeriod}
                    />
                    <>
                        {!volumeLoading ? (
                            volumeTab === StatTab.History ? (
                                <Graph lines={linesData} />
                            ) : (
                                <DoughnutChart
                                    title="Volume"
                                    quoteCurrency={quoteCurrency}
                                    data={doughnutData}
                                />
                            )
                        ) : (
                            <Loading alt={true} />
                        )}
                    </>
                </div>
            </Stat>
        </div>
    );
};
