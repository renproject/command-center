import * as React from "react";

import { faFire } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Loading } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { OrderedMap } from "immutable";
import { Scatter } from "react-chartjs-2";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators } from "redux";

import { HistoryIterations, HistoryPeriod } from "../../../lib/ethereum/contractReads";
import { _captureBackgroundException_ } from "../../../lib/react/errors";
import { ApplicationState, DarknodesState } from "../../../store/applicationState";
import {
    updateDarknodeBalanceHistory, updateSecondsPerBlock,
} from "../../../store/network/operatorActions";
import { AppDispatch } from "../../../store/rootReducer";
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

const defaultState = { // Entries must be immutable
    historyPeriod: HistoryPeriod.Week,
    nextHistoryPeriod: HistoryPeriod.Week,
    loadingHistory: false,
};

class GasGraphClass extends React.Component<Props, State> {
    private updateHistoryStarted: boolean = false;
    private updateHistoryTimeout: NodeJS.Timer | undefined;
    private localTimeout: NodeJS.Timer | undefined;
    /**
     * _isMounted is used to prevent setting state after the component has been
     * unmounted.
     */
    private _isMounted: boolean = false;

    constructor(props: Props) {
        super(props);
        this.state = defaultState;
    }

    public componentDidMount = (): void => {
        this._isMounted = true;
        const { store: { secondsPerBlock, web3 } } = this.props;
        if (secondsPerBlock === null) {
            this.props.actions.updateSecondsPerBlock(web3)
                .catch((error) => {
                    _captureBackgroundException_(error, {
                        description: "Error in componentDidMount in GasGraph",
                    });
                });
        }

        this.componentWillReceiveProps(this.props);
    }

    public componentWillReceiveProps = (nextProps: Props): void => {
        // Check if the darknode's balances have changed
        const changedBalance =
            nextProps.darknodeDetails && nextProps.darknodeDetails.ethBalance &&
            this.props.darknodeDetails && this.props.darknodeDetails.ethBalance &&
            !nextProps.darknodeDetails.ethBalance.isEqualTo(this.props.darknodeDetails.ethBalance);

        if (changedBalance || (this.updateHistoryStarted === false && nextProps.darknodeDetails)) {
            this.updateHistory(nextProps).catch((error => {
                _captureBackgroundException_(error, {
                    description: "Error in componentWillReceiveProps in GasGraph",
                });
            }));
        }
    }

    public componentWillUnmount = (): void => {
        this._isMounted = false;
        if (this.updateHistoryTimeout) { clearTimeout(this.updateHistoryTimeout); }
        if (this.localTimeout) { clearTimeout(this.localTimeout); }
    }

    public updateHistory = async (
        props: Props | undefined,
        historyPeriod?: HistoryPeriod | undefined
    ): Promise<void> => {
        this.updateHistoryStarted = true;

        if (this.localTimeout) { clearTimeout(this.localTimeout); }
        this.localTimeout = setTimeout(() => {
            if (this._isMounted) {
                this.setState({ loadingHistory: true });
            }
        }, 100);

        historyPeriod = historyPeriod || this.state.nextHistoryPeriod;
        const { store: { balanceHistories, web3, secondsPerBlock }, darknodeDetails } = props || this.props;

        let retry = 1; // Retry in a second, unless the call succeeds.

        if (darknodeDetails && secondsPerBlock !== null) {
            retry = 60 * 5; // 5 minutes

            const balanceHistory = balanceHistories.get(darknodeDetails.ID) || OrderedMap<number, BigNumber>();
            try {
                // tslint:disable-next-line: await-promise
                await this.props.actions.fetchDarknodeBalanceHistory(
                    web3,
                    darknodeDetails.ID,
                    balanceHistory,
                    historyPeriod,
                    secondsPerBlock
                );
            } catch (error) {
                _captureBackgroundException_(error, {
                    description: "Error in updateHistory in GasGraph",
                });
            }
        }

        if (this.localTimeout) { clearTimeout(this.localTimeout); }
        if (this._isMounted) {
            this.setState({ loadingHistory: false });
        }

        // tslint:disable-next-line: no-any
        clearTimeout(this.updateHistoryTimeout as any);
        this.updateHistoryTimeout = setTimeout(this.updateHistory, retry * 1000) as unknown as NodeJS.Timer;
    }

    public render = (): JSX.Element => {
        const { historyPeriod, nextHistoryPeriod, loadingHistory } = this.state;

        const { darknodeDetails, store: { secondsPerBlock } } = this.props;

        let balanceHistory;
        if (darknodeDetails) {
            const { store: { balanceHistories } } = this.props;
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
                        {periods.map(([period, periodString]: [HistoryPeriod, string]) => {
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

    private readonly handleSelectTime = async (event: React.FormEvent<HTMLButtonElement>): Promise<void> => {
        const element = (event.target as HTMLButtonElement);
        try {
            if (this.updateHistoryTimeout) { clearTimeout(this.updateHistoryTimeout); }
            const historyPeriod = parseInt(element.value, 10);

            this.setState((current: State) => ({ ...current, nextHistoryPeriod: historyPeriod }));
            await this.updateHistory(undefined, historyPeriod);

            // Component may have unmounted while updating
            if (this._isMounted) {
                this.setState((current: State) => ({ ...current, historyPeriod }));
            }
        } catch (error) {
            _captureBackgroundException_(error, {
                description: "Error in handleSelectTime in GasGraph",
            });
        }
    }
}

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

type State = typeof defaultState;

export const GasGraph = connect(mapStateToProps, mapDispatchToProps)(GasGraphClass);
