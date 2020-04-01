import { CurrencyIcon, Loading, TokenIcon } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { connect } from "react-redux";

import { Token } from "../../lib/ethereum/tokens";
import { ApplicationState } from "../../store/applicationState";
import { TokenBalance } from "../common/TokenBalance";

const mapStateToProps = (state: ApplicationState) => ({
    previousCycle: state.network.previousCycle,
    currentCycle: state.network.currentCycle,
    quoteCurrency: state.network.quoteCurrency,
    pendingRewardsInEth: state.network.pendingRewardsInEth,
    currentShareCount: state.network.currentShareCount,
});

const colors = [
    // Token colours
    // "#d9a547",
    // "#F09242",
    // "#f4b728",
    // "#627eea",
    // Old colours
    "#B8DCFF",
    "#02BBFF",
    "#006FE8",
    "#1CDED2",
    "91FFFE",
];

enum Tab {
    Current = "current",
    Previous = "previous",
}

export const RewardChart = connect(mapStateToProps)(({
    previousCycle, currentCycle, quoteCurrency, pendingRewardsInEth, currentShareCount,
}: ReturnType<typeof mapStateToProps>) => {
    const [tab, setTab] = React.useState(Tab.Previous);

    const currentSplit = pendingRewardsInEth.get(tab === Tab.Previous ? previousCycle : currentCycle);

    const keys = React.useMemo(() => currentSplit ? currentSplit.keySeq().toArray() : [], [currentSplit]);
    const values = React.useMemo(() => currentSplit ? currentSplit.valueSeq().map(bn => bn.multipliedBy(currentShareCount).decimalPlaces(6).toNumber()).toArray() : [], [currentSplit]);
    const empty = React.useMemo(() => !!currentSplit && values.reduce((sum, value) => sum + value, 0) === 0, [currentSplit, values]);

    const selectCurrent = React.useCallback(() => setTab(Tab.Current), []);
    const selectPrevious = React.useCallback(() => setTab(Tab.Previous), []);

    return <div className="overview--chart--outer">
        <div className="chart--tabs">
            <div role="tab" onClick={selectPrevious} className={["chart--tab", tab === Tab.Previous ? "chart--tab--selected" : ""].join(" ")}><span>Last cycle</span></div>
            <div role="tab" onClick={selectCurrent} className={["chart--tab", tab === Tab.Current ? "chart--tab--selected" : ""].join(" ")}><span>Current cycle</span></div>
        </div>
        <div className="overview--chart">
            {currentSplit ? <><div className="overview--chart--canvas">
                <Doughnut
                    height={200}
                    width={200}
                    legend={{ display: false }}
                    data={{
                        maintainAspectRation: true,
                        labels: empty ? ["No rewards for cycle yet"] : keys,
                        datasets: [{
                            data: empty ? [100] : values,
                            backgroundColor: empty ? ["#00000000"] : colors,
                            borderColor: "#001A38",
                            maintainAspectRation: true,
                            // hoverBackgroundColor: [],
                        }]
                    }}
                />
            </div>
                <div className="overview--chart--legend">
                    <div className="overview--chart--legend--table">
                        {currentSplit ? currentSplit.toArray().map(([token, value], i) => {
                            return <div key={token} style={{ color: colors[i] }}>
                                <div>
                                    <TokenIcon token={token} white={true} /><span>{token}</span>
                                </div>
                                <div>
                                    <CurrencyIcon currency={quoteCurrency} />
                                    <TokenBalance
                                        token={Token.ETH}
                                        amount={value.multipliedBy(currentShareCount).multipliedBy(new BigNumber(10).pow(18))}
                                        convertTo={quoteCurrency}
                                    />
                                </div>
                            </div>;
                        }) : <></>}
                    </div>
                </div>
            </> : <Loading alt />}
        </div>
    </div>;
});
