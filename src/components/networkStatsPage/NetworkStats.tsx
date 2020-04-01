import { CurrencyIcon, Loading } from "@renproject/react-components";
import React from "react";
import { connect } from "react-redux";

import { Token } from "../../lib/ethereum/tokens";
import { ApplicationState } from "../../store/applicationState";
import { Stat, Stats } from "../common/Stat";
import { TokenBalance } from "../common/TokenBalance";
import { RewardChart } from "./RewardChart";

const mapStateToProps = (state: ApplicationState) => ({
    currentCycle: state.network.currentCycle,
    previousCycle: state.network.previousCycle,
    pendingTotalInEth: state.network.pendingTotalInEth,
    quoteCurrency: state.network.quoteCurrency,
    currentShareCount: state.network.currentShareCount,
    currentDarknodeCount: state.network.currentDarknodeCount,
    previousDarknodeCount: state.network.previousDarknodeCount,
    nextDarknodeCount: state.network.nextDarknodeCount,
});

export const NetworkStats = connect(mapStateToProps)(({
    currentCycle, previousCycle, pendingTotalInEth, quoteCurrency,
    currentShareCount, currentDarknodeCount, previousDarknodeCount,
    nextDarknodeCount,
}: ReturnType<typeof mapStateToProps>) => {
    const current = pendingTotalInEth.get(currentCycle, undefined);
    const previous = pendingTotalInEth.get(previousCycle, undefined);
    const currentSummed = current ? current.times(currentShareCount) : undefined;
    const previousSummed = previous ? previous.times(currentShareCount) : undefined;

    return (
        <div className="network-stats container">
            <div className="col-lg-8">
                <Stats>
                    <Stat message="Volume" big>
                        {previousSummed ? <><CurrencyIcon currency={quoteCurrency} /><TokenBalance
                            token={Token.ETH}
                            convertTo={quoteCurrency}
                            amount={previousSummed}
                        /></> : <Loading alt />}
                    </Stat>
                    <Stat message="Value locked" big>
                        {currentSummed ? <>
                            <CurrencyIcon currency={quoteCurrency} />
                            <TokenBalance
                                token={Token.ETH}
                                convertTo={quoteCurrency}
                                amount={currentSummed}
                            /></> : <Loading alt />}
                    </Stat>
                </Stats>

                <div className="overview--bottom">
                    <RewardChart />
                </div>
            </div>
            <div className="col-lg-4">
                <Stats>
                    <Stat message="Collateralization" big>
                        RenVM is currently over-collateralized.
                    </Stat>
                </Stats>
            </div>
        </div>
    );
});
