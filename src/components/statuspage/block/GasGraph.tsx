import * as React from "react";

import BigNumber from "bignumber.js";

import { faFire } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { OrderedMap } from "immutable";
import { Scatter } from "react-chartjs-2";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import {
    calculateSecondsPerBlock,
    fetchDarknodeBalanceHistory,
    HistoryIterations,
    HistoryPeriods,
} from "../../../actions/statistics/operatorActions";
import { ApplicationData, DarknodeDetails } from "../../../reducers/types";
import { Loading } from "../../Loading";
import { Block, BlockBody, BlockTitle } from "./Block";

interface Props extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
    darknodeDetails: DarknodeDetails | null;
}

interface State {
    historyPeriod: HistoryPeriods;
    nextHistoryPeriod: HistoryPeriods;
    loadingHistory: boolean;
}

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
            title: (item: any) => `Block ${item[0].xLabel}`,
            // tslint:disable-next-line:no-any
            label: (item: any) => `${item.yLabel} ETH`,
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

const periods = [
    [HistoryPeriods.Day, "1D"],
    [HistoryPeriods.Week, "1W"],
    [HistoryPeriods.Month, "1M"],
    [HistoryPeriods.HalfYear, "6M"],
    [HistoryPeriods.Year, "1Y"],
];

class GasGraphClass extends React.Component<Props, State> {
    private updateHistoryTimeout: NodeJS.Timer | undefined;
    private localTimeout: NodeJS.Timer | undefined;

    constructor(props: Props) {
        super(props);
        this.state = {
            historyPeriod: HistoryPeriods.Week,
            nextHistoryPeriod: HistoryPeriods.Week,
            loadingHistory: false,
        };
    }

    public componentDidMount = () => {
        const { store: { secondsPerBlock, sdk } } = this.props;
        if (secondsPerBlock === null) {
            this.props.actions.calculateSecondsPerBlock(sdk);
        }

        this.componentWillReceiveProps(this.props);
    }

    public componentWillReceiveProps = (nextProps: Props) => {
        if (!this.updateHistoryTimeout && nextProps.darknodeDetails) {
            this.updateHistory(nextProps).catch(console.error);
        }
    }

    public componentWillUnmount = () => {
        if (this.updateHistoryTimeout) { clearTimeout(this.updateHistoryTimeout); }
        if (this.localTimeout) { clearTimeout(this.localTimeout); }
    }

    public updateHistory = async (props: Props | undefined, historyPeriod?: HistoryPeriods | undefined) => {

        try {
            if (this.localTimeout) { clearTimeout(this.localTimeout); }
            this.localTimeout = setTimeout(() => this.setState({ loadingHistory: true }), 100);
        } catch (error) {
            // Component was probably unmounted and clearTimeout had bad timing
            return;
        }

        historyPeriod = historyPeriod || this.state.nextHistoryPeriod;
        const { store: { balanceHistories, sdk, secondsPerBlock }, darknodeDetails } = props || this.props;

        let retry = 1 * 1000;

        if (darknodeDetails && secondsPerBlock !== null) {
            retry = 30 * 1000;

            const balanceHistory = balanceHistories.get(darknodeDetails.ID) || OrderedMap<number, BigNumber>();
            try {
                await this.props.actions.fetchDarknodeBalanceHistory(
                    sdk,
                    darknodeDetails.ID,
                    balanceHistory,
                    historyPeriod,
                    secondsPerBlock
                );
            } catch (error) {
                console.error(error);
            }
        }

        try {
            if (this.localTimeout) { clearTimeout(this.localTimeout); }
            this.setState({ loadingHistory: false });
        } catch (error) {
            // Component was probably unmounted and clearTimeout had bad timing
            return;
        }

        this.updateHistoryTimeout = setTimeout(this.updateHistory, retry) as unknown as NodeJS.Timer;
    }

    public render = () => {
        const { historyPeriod, nextHistoryPeriod, loadingHistory } = this.state;

        const { darknodeDetails, store: { secondsPerBlock } } = this.props;

        let balanceHistory;
        if (darknodeDetails) {
            const { store: { balanceHistories } } = this.props;
            balanceHistory = balanceHistories.get(darknodeDetails.ID) || OrderedMap<number, BigNumber>();
        }

        let chartData;
        if (balanceHistory && secondsPerBlock) {
            const xyPoints: Array<{ x: number, y: number }> = [];

            const jump = Math.floor((historyPeriod / secondsPerBlock) / HistoryIterations);

            const currentBlock: number | undefined = balanceHistory.keySeq().max();

            if (currentBlock) {

                let first = currentBlock - (HistoryIterations - 1) * jump;
                first = first - first % jump;

                balanceHistory.map((y, x) => {
                    if (x >= first) {
                        xyPoints.push({ x, y: y ? y.div(shift).toNumber() : 0 });
                    }
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
                            borderDashOffset: 0.0,
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
                {/* {showAdvanced ? <div className="block--basic--hide" onClick={this.toggleAdvanced}>
                <FontAwesomeIcon icon={faTimes} pull="left" />
            </div> : null} */}

                <BlockTitle>
                    <h3>
                        <FontAwesomeIcon icon={faFire} pull="left" />
                        Gas History
                    </h3>
                </BlockTitle>

                <BlockBody>
                    {chartData ? <Scatter data={chartData} options={options} /> : <div className="graph-placeholder" />}
                    <div className="gas-graph--times">
                        {periods.map(([period, periodString]) => {
                            return <button
                                key={period}
                                className={nextHistoryPeriod === period ? "selected" : ""}
                                disabled={loadingHistory || nextHistoryPeriod === period}
                                value={period}
                                name="historyPeriod"
                                onClick={this.handleSelectTime}
                            >
                                {nextHistoryPeriod === period && loadingHistory ? <Loading alt={true} /> : periodString}
                            </button>;
                        })}
                    </div>
                </BlockBody>
            </Block>
        );
    }

    private handleSelectTime = async (event: React.FormEvent<HTMLButtonElement>): Promise<void> => {
        const element = (event.target as HTMLButtonElement);
        try {
            if (this.updateHistoryTimeout) { clearTimeout(this.updateHistoryTimeout); }
            const historyPeriod = parseInt(element.value, 10);

            this.setState((current) => ({ ...current, nextHistoryPeriod: historyPeriod }));
            await this.updateHistory(undefined, historyPeriod);
            this.setState((current) => ({ ...current, historyPeriod }));
        } catch (error) {
            console.error(error);
        }
    }
}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        sdk: state.trader.sdk,
        balanceHistories: state.statistics.balanceHistories,
        secondsPerBlock: state.statistics.secondsPerBlock,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        fetchDarknodeBalanceHistory,
        calculateSecondsPerBlock,
    }, dispatch),
});

export const GasGraph = connect(mapStateToProps, mapDispatchToProps)(GasGraphClass);
