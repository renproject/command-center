import * as React from "react";

import { faFire } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Loading } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { OrderedMap } from "immutable";
import { Scatter } from "react-chartjs-2";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators } from "redux";

import { HistoryIterations, HistoryPeriod } from "../../../../lib/ethereum/contractReads";
import { _catchBackgroundException_, _ignoreException_ } from "../../../../lib/react/errors";
import { ApplicationState, DarknodesState } from "../../../../store/applicationState";
import {
    updateDarknodeBalanceHistory, updateSecondsPerBlock,
} from "../../../../store/network/operatorActions";
import { AppDispatch } from "../../../../store/rootReducer";
import { Block, BlockBody, BlockTitle } from "./Block";

const shift = new BigNumber(10).exponentiatedBy(18);

const options = {
    showLines: true,
    title: {
        display: false,
    },
    // Show "ETH" unit in the on-hover tooltip
    tooltips: {
        callbacks: {
            // tslint:disable-next-line:no-any
            title: (item: any): string => `Block ${item[0].xLabel}`,
            // tslint:disable-next-line:no-any
            label: (item: any): string => `${item.yLabel} ETH`,
        },
    },
    legend: {
        display: false,
    },
    scales: {
        xAxes: [{
            display: false, // Remove all the x-axis grid lines
        }],
        yAxes: [{
            display: false, // Remove all the y-axis grid lines
            ticks: {
                beginAtZero: true,
            }
        }],
    }
};

const periods: Array<[HistoryPeriod, string]> = [
    [HistoryPeriod.Day, "1D"],
    [HistoryPeriod.Week, "1W"],
    [HistoryPeriod.Month, "1M"],
    [HistoryPeriod.HalfYear, "6M"],
    [HistoryPeriod.Year, "1Y"],
];


const GasGraphClass: React.StatelessComponent<Props> = ({ darknodeDetails, store: { secondsPerBlock, web3, balanceHistories }, actions }) => {

    const [historyPeriod, setHistoryPeriod] = React.useState(HistoryPeriod.Week);
    const [nextHistoryPeriod, setNextHistoryPeriod] = React.useState(HistoryPeriod.Week);
    const [loadingHistory, setLoadingHistory] = React.useState(false);
    // tslint:disable-next-line: prefer-const
    let [updateHistoryStarted, setUpdateHistoryStarted] = React.useState(false);
    const [currentEthBalance, setCurrentEthBalance] = React.useState<string | null>(null);

    const [updateHistoryTimeout, setUpdateHistoryTimeout] = React.useState<NodeJS.Timer | undefined>(undefined);
    const [localTimeout, setLocalTimeout] = React.useState<NodeJS.Timer | undefined>(undefined);


    React.useEffect(() => {
        if (secondsPerBlock === null) {
            actions.updateSecondsPerBlock(web3)
                .catch((error) => {
                    _catchBackgroundException_(error, "Error in GasGraph > updateSecondsPerBlock");
                });
        }

        // On unmount:
        return () => {
            if (updateHistoryTimeout) { clearTimeout(updateHistoryTimeout); }
            if (localTimeout) { clearTimeout(localTimeout); }
        };
    }, []);

    const updateHistory = async (
        selectedHistoryPeriod?: HistoryPeriod | undefined
    ): Promise<void> => {
        setUpdateHistoryStarted(true);
        updateHistoryStarted = true;

        if (localTimeout) { clearTimeout(localTimeout); }
        setLocalTimeout(setTimeout(() => {
            setLoadingHistory(true);
        }, 100));

        selectedHistoryPeriod = selectedHistoryPeriod || nextHistoryPeriod;

        let retry = 1; // Retry in a second, unless the call succeeds.

        if (darknodeDetails && secondsPerBlock !== null) {
            retry = 60 * 5; // 5 minutes

            const currentBalanceHistory = balanceHistories.get(darknodeDetails.ID) || OrderedMap<number, BigNumber>();
            try {
                // tslint:disable-next-line: await-promise
                await actions.fetchDarknodeBalanceHistory(
                    web3,
                    darknodeDetails.ID,
                    currentBalanceHistory,
                    selectedHistoryPeriod,
                    secondsPerBlock
                );
            } catch (error) {
                if (String(error && error.message).match(/project ID does not have access to archive state/)) {
                    _ignoreException_(error);
                } else {
                    _catchBackgroundException_(error, "Error in GasGraph > updateHistory > fetchDarknodeBalanceHistory");
                }
            }
        }

        if (localTimeout) { clearTimeout(localTimeout); }
        setLoadingHistory(false);

        // tslint:disable-next-line: no-any
        clearTimeout(updateHistoryTimeout as any);
        setUpdateHistoryTimeout(setTimeout(updateHistory, retry * 1000) as unknown as NodeJS.Timer);
    };

    // Check if the darknode's balances have changed
    const ethBalance = React.useMemo(() => darknodeDetails && darknodeDetails.ethBalance && darknodeDetails.ethBalance.toString(), [darknodeDetails]);

    React.useEffect(() => {
        setCurrentEthBalance(ethBalance);

        if (ethBalance !== currentEthBalance || (updateHistoryStarted === false && darknodeDetails)) {
            updateHistory().catch((error => {
                _catchBackgroundException_(error, "Error in GasGraph > componentWillReceiveProps");
            }));
        }
    }, [ethBalance]);

    const handleSelectTime = async (event: React.FormEvent<HTMLButtonElement>): Promise<void> => {
        const element = (event.target as HTMLButtonElement);
        try {
            if (updateHistoryTimeout) { clearTimeout(updateHistoryTimeout); }
            const selectedHistoryPeriod = parseInt(element.value, 10);

            setNextHistoryPeriod(selectedHistoryPeriod);
            await updateHistory(selectedHistoryPeriod);

            setHistoryPeriod(selectedHistoryPeriod);
        } catch (error) {
            _catchBackgroundException_(error, "Error in GasGraph > handleSelectTime");
        }
    };

    let balanceHistory;
    if (darknodeDetails) {
        balanceHistory = balanceHistories.get(darknodeDetails.ID) || OrderedMap<number, BigNumber>();
    }

    let chartData;
    if (balanceHistory && secondsPerBlock) {
        const xyPoints: Array<{ x: number; y: number }> = [];

        const jump = Math.floor((historyPeriod / secondsPerBlock) / HistoryIterations);

        const currentBlock: number | undefined = balanceHistory.keySeq().max();

        if (currentBlock) {

            let first = currentBlock - (HistoryIterations - 1) * jump;
            first = first - first % jump;

            balanceHistory.map((y: BigNumber, x: number) => {
                if (x >= first) {
                    xyPoints.push({ x, y: y ? y.div(shift).toNumber() : 0 });
                }
                return null;
            });

            // for (let i = 0; i < HistoryIterations; i++) {
            //     let x = currentBlock - i * jump;
            //     x = x - x % jump;
            //     const y = balanceHistory.get(x);
            //     xyPoints.push({ x, y: y ? y.div(shift).toNumber() : 0 });
            // }

            chartData = {
                // labels: xyPoints.map(({ x, y }) => `Block ${x}`),
                datasets: [
                    {
                        label: "Gas usage",
                        fill: false,
                        lineTension: 0,
                        backgroundColor: "#F45532",
                        borderColor: "#F45532",
                        borderCapStyle: "butt",
                        borderDash: [],
                        borderDashOffset: 0,
                        borderJoinStyle: "miter",
                        pointBorderColor: "#F45532",
                        pointBackgroundColor: "#F45532",
                        pointBorderWidth: 1,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: "#F45532",
                        pointHoverBorderColor: "#F45532",
                        pointHoverBorderWidth: 2,
                        pointRadius: 1,
                        pointHitRadius: 10,
                        data: xyPoints, // .map(({ x, y }) => y),
                    }
                ]
            };
        }
    }

    return (

        <Block className="gas-graph">
            <BlockTitle>
                <h3>
                    <FontAwesomeIcon icon={faFire} pull="left" />
                    Gas History
                    </h3>
            </BlockTitle>

            <BlockBody>
                {chartData ? <Scatter data={chartData} options={options} /> : <div className="graph-placeholder" />}
                <div className="gas-graph--times">
                    {periods.map(([period, periodString]: [HistoryPeriod, string]) => {
                        return <button
                            key={period}
                            className={nextHistoryPeriod === period ? "selected" : ""}
                            disabled={loadingHistory || nextHistoryPeriod === period}
                            value={period}
                            name="historyPeriod"
                            onClick={handleSelectTime}
                        >
                            {nextHistoryPeriod === period && loadingHistory ? <Loading alt /> : periodString}
                        </button>;
                    })}
                </div>
            </BlockBody>
        </Block>
    );
};

const mapStateToProps = (state: ApplicationState) => ({
    store: {
        web3: state.account.web3,
        balanceHistories: state.network.balanceHistories,
        secondsPerBlock: state.network.secondsPerBlock,
    },
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    actions: bindActionCreators({
        fetchDarknodeBalanceHistory: updateDarknodeBalanceHistory,
        updateSecondsPerBlock,
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
    darknodeDetails: DarknodesState | null;
}

export const GasGraph = connect(mapStateToProps, mapDispatchToProps)(GasGraphClass);
