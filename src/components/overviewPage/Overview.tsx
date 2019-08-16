import { CurrencyIcon, Loading, TokenIcon } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { drizzleReactHooks } from "drizzle-react";
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { connect } from "react-redux";

import { Token } from "../../lib/ethereum/tokens";
import { ApplicationState } from "../../store/applicationState";
import { Stat, Stats } from "../common/Stat";
import { TokenBalance } from "../common/TokenBalance";
import { DarknodeMap } from "./darknodeMap/DarknodeMap";
import { MapContainer } from "./mapContainer";

const mapStateToProps = (state: ApplicationState) => ({
    currentCycle: state.network.currentCycle,
    previousCycle: state.network.previousCycle,
    pendingTotalInEth: state.network.pendingTotalInEth,
    quoteCurrency: state.network.quoteCurrency,
    pendingRewardsInEth: state.network.pendingRewardsInEth,
});

const colors = [
    "#B8DCFF",
    "#02BBFF",
    "#006FE8",
    "#1CDED2",
    "91FFFE",
];

export const Overview = connect(mapStateToProps)(({
    currentCycle, previousCycle, pendingTotalInEth, quoteCurrency, pendingRewardsInEth
}: ReturnType<typeof mapStateToProps>) => {
    const container = MapContainer.useContainer();
    const { useCacheCall } = drizzleReactHooks.useDrizzle();
    const numDarknodesNextEpoch = useCacheCall("DarknodeRegistry", "numDarknodesNextEpoch") || 0;
    const numDarknodes = useCacheCall("DarknodeRegistry", "numDarknodes") || 0;
    // const shareCount = useCacheCall("DarknodePayment", "shareCount") || 0;
    const current = pendingTotalInEth.get(currentCycle, undefined);
    const previous = pendingTotalInEth.get(previousCycle, undefined);
    const currentSplit = pendingRewardsInEth.get(previousCycle);

    // // tslint:disable-next-line: no-any
    // const [totalRewards, rewardShare] = useCacheCall(["DarknodePayment"], (call: (contract: string, fnName: string, ...args: any[]) => any) => {
    //     // const tokens: string[] = [];
    //     // for (let limit = 11; limit >= 0; limit--) {
    //     //     try {
    //     //         const next = call("DarknodePayment", "registeredTokens", tokens.length);
    //     //         if (next) {
    //     //             tokens.push(next);
    //     //         } else {
    //     //             break;
    //     //         }
    //     //     } catch (error) {
    //     //         break;
    //     //     }
    //     // }

    //     const previous = NewTokenDetails.map(async (_tokenDetails, token) => {
    //             try {
    //                 const previousCycleRewardShareBN = call("DarknodePayment", "previousCycleRewardShare", token).call();
    //                 if (previousCycleRewardShareBN === null) {
    //                     return new BigNumber(0);
    //                 }
    //                 return new BigNumber(previousCycleRewardShareBN.toString());
    //             } catch (error) {
    //                 return new BigNumber(0);
    //             }
    //         }).toOrderedMap(),
    //     );

    //     const rewardSum = tokens.reduce((sum, token) => {
    //         let reward = call("DarknodePayment", "currentCycleRewardPool", token);
    //         return reward ? sum + reward : sum;
    //     }, 0);
    //     const darknodeCount = call("DarknodePayment", "shareCount") || 0;
    //     return [rewardSum, darknodeCount ? rewardSum / darknodeCount : 0];
    // });

    return (
        <div className="overview container">
            <Stats>
                <Stat message="Darknodes online">
                    <Stats>
                        <Stat message="Registered" big>{numDarknodes}</Stat>
                        <Stat message="Online" big>
                            {container.darknodeCount === null ? <Loading alt /> : <>
                                {container.darknodeCount}
                                <span className={["stat--children--diff", container.darknodeCount - numDarknodes >= 0 ? "green" : "red"].join(" ")}>
                                    {container.darknodeCount - numDarknodes}
                                </span>
                            </>}
                        </Stat>
                        <Stat message="Change next epoch" big>{numDarknodes - numDarknodesNextEpoch}</Stat>
                        <Stat message="% Ren Registered" big>{100 * numDarknodes / 10000}%</Stat>
                    </Stats>
                </Stat>
                <Stat message="Darknode rewards per Darknode">
                    <Stats>
                        {/* <Stat message="All time total" big>$?</Stat> */}
                        <Stat message="Current cycle" big>
                            {current ? <>
                                <CurrencyIcon currency={quoteCurrency} />
                                <TokenBalance
                                    token={Token.ETH}
                                    convertTo={quoteCurrency}
                                    amount={current}
                                /></> : <Loading alt />}</Stat>
                        <Stat message="Last cycle" highlight big>
                            {previous ? <><CurrencyIcon currency={quoteCurrency} /><TokenBalance
                                token={Token.ETH}
                                convertTo={quoteCurrency}
                                amount={previous}
                            /></> : <Loading alt />}
                        </Stat>
                    </Stats>
                </Stat>
            </Stats>

            <div className="overview--bottom">
                <DarknodeMap />
                <div className="overview--chart">
                    <div className="overview--chart--canvas">
                        <Doughnut
                            height={200}
                            width={200}
                            legend={{ display: false }}
                            data={{
                                maintainAspectRation: true,
                                labels: currentSplit ? currentSplit.keySeq().toArray() : [],
                                datasets: [{
                                    data: currentSplit ? currentSplit.valueSeq().map(bn => bn.toNumber()).toArray() : [],
                                    backgroundColor: colors,
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
                                        <TokenIcon token={token} /><span>{token}</span>
                                    </div>
                                    <div>
                                        <CurrencyIcon currency={quoteCurrency} />
                                        <TokenBalance
                                            token={Token.ETH}
                                            amount={value.multipliedBy(new BigNumber(10).pow(18))}
                                            convertTo={quoteCurrency}
                                        />
                                    </div>
                                </div>;
                            }) : <></>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});
