import { CurrencyIcon, Loading } from "@renproject/react-components";
import React from "react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";

import { Token } from "../../lib/ethereum/tokens";
import { EpochContainer } from "../../store/epochStore";
import { GithubAPIContainer } from "../../store/githubApiStore";
import { NetworkStateContainer } from "../../store/networkStateContainer";
import {
    ReactComponent as IconDarknodesOnline,
} from "../../styles/images/icon-darknodes-online.svg";
import { ReactComponent as IconIncome } from "../../styles/images/icon-income.svg";
import { ReactComponent as RewardsIcon } from "../../styles/images/icon-rewards-white.svg";
import { Change } from "../common/Change";
import { Stat, Stats } from "../common/Stat";
import { TokenBalance } from "../common/TokenBalance";
import { DarknodeMap } from "./darknodeMap/DarknodeMap";
import { MapContainer } from "./mapContainer";

export const Overview = () => {
    const { currentCycle, previousCycle, pendingTotalInEth, quoteCurrency, currentShareCount, currentDarknodeCount, nextDarknodeCount } = NetworkStateContainer.useContainer();
    const { timeUntilNextEpoch, timeSinceLastEpoch, epochInterval } = EpochContainer.useContainer();
    const { latestCLIVersion, latestCLIVersionDaysAgo } = GithubAPIContainer.useContainer();

    const container = MapContainer.useContainer();
    const current = pendingTotalInEth.get(currentCycle, undefined);
    const previous = pendingTotalInEth.get(previousCycle, undefined);
    const currentSummed = current ? current.times(currentShareCount) : undefined;
    const previousSummed = previous ? previous.times(currentShareCount) : undefined;

    return (
        <div className="overview container">
            <Stats>
                <Stat icon={<IconDarknodesOnline />} message="Darknodes online">
                    <Stats>
                        {/* <Stat message="Registered" big>{currentDarknodeCount === null ? <Loading alt={true} /> : <>
                            {currentDarknodeCount}
                            {previousDarknodeCount !== null ? <Change className="stat--children--diff" change={currentDarknodeCount - previousDarknodeCount} /> : <></>}
                        </>}</Stat> */}
                        <Stat message="Online" big>
                            {container.darknodeCount === null ? <Loading alt /> : <>
                                {container.darknodeCount}

                            </>}
                        </Stat>
                        <Stat message="Change next epoch" big>{nextDarknodeCount === null || currentDarknodeCount === null ? <Loading alt={true} /> : <>
                            <Change change={nextDarknodeCount - currentDarknodeCount} />
                        </>}</Stat>
                        <Stat message="% Ren Registered" big>{currentDarknodeCount === null ? <Loading alt={true} /> : <>
                            {100 * currentDarknodeCount / 100000}%
                        </>}</Stat>
                    </Stats>
                </Stat>
                <Stat icon={<IconIncome />} message="Darknode rewards">
                    <Stats>
                        <Stat message="All time total" big>
                            {previousSummed ? <><CurrencyIcon currency={quoteCurrency} /><TokenBalance
                                token={Token.ETH}
                                convertTo={quoteCurrency}
                                amount={0}
                            /></> : <Loading alt />}
                        </Stat>
                        <Stat message="Last cycle" big>
                            {previousSummed ? <><CurrencyIcon currency={quoteCurrency} /><TokenBalance
                                token={Token.ETH}
                                convertTo={quoteCurrency}
                                amount={previousSummed}
                            /></> : <Loading alt />}
                        </Stat>
                        <Stat message="Current cycle" highlight={true} big={true} icon={<RewardsIcon />}>
                            {currentSummed ? <>
                                <CurrencyIcon currency={quoteCurrency} />
                                <TokenBalance
                                    token={Token.ETH}
                                    convertTo={quoteCurrency}
                                    amount={currentSummed}
                                /></> : <Loading alt />}</Stat>
                    </Stats>
                </Stat>
            </Stats>

            <div className="overview--bottom">
                <DarknodeMap />
                <Stats className="overview--bottom--right">
                    {/* <Stat message="All time total" big>$?</Stat> */}
                    <Stat message="Reward Period/EPOCH Ends" highlight={true} nested={true}>
                        <div className="epoch--block--charts epoch--block--charts--small">
                            <div className="resources--chart--and--label">
                                <div className="epoch-chart--small">
                                    <CircularProgressbar
                                        value={Math.min((timeSinceLastEpoch || 0) / (epochInterval || 1), 100)}
                                        text={`${Math.floor((timeSinceLastEpoch || 0) / 60 / 60 / 24)} days`}
                                        styles={buildStyles({
                                            // Text size
                                            textSize: "16px",

                                            // How long animation takes to go from one percentage to another, in seconds
                                            pathTransitionDuration: 0.5,

                                            // Can specify path transition in more detail, or remove it entirely
                                            // pathTransition: 'none',

                                            // Colors
                                            pathColor: `#006FE8`,
                                            textColor: "#fff",
                                            trailColor: "#173453",
                                        })}
                                    />

                                </div>
                            </div>
                            <div className="epoch-right">
                                <p>{Math.floor((timeUntilNextEpoch || 0) / 60 / 60 / 24)} days until next epoch</p>
                                <p>Ends 00:00 UTC 23rd April, 2020</p>
                            </div>
                        </div>
                    </Stat>
                    <Stat message="Darknode CLI Information" className="darknode-cli" highlight={true} nested={true}>
                        <div className="darknode-cli--top">
                            <p>
                                Latest CLI Version <b>{latestCLIVersion}</b>
                            </p>
                            <p>
                                Version published <b>{latestCLIVersionDaysAgo}</b>
                            </p>
                        </div>
                        <button className="darknode-cli--button button">Launch a Darknode</button>
                    </Stat>
                </Stats>
                {/* <RewardChart /> */}
            </div>
        </div>
    );
};
