import { CurrencyIcon, Loading, naturalTime } from "@renproject/react-components";
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
import { ExternalLink } from "../common/ExternalLink";
import { Stat, Stats } from "../common/Stat";
import { TokenBalance } from "../common/TokenBalance";
import { DarknodeMap } from "./darknodeMap/DarknodeMap";

export const NetworkDarknodesPage = () => {
    const { currentCycle, previousCycle, pendingTotalInEth, quoteCurrency, currentShareCount, previousShareCount, currentDarknodeCount, nextDarknodeCount, payoutPercent, previousDarknodeCount } = NetworkStateContainer.useContainer();
    const { timeUntilNextEpoch, timeSinceLastEpoch, epochInterval } = EpochContainer.useContainer();
    const { latestCLIVersion, latestCLIVersionDaysAgo } = GithubAPIContainer.useContainer();

    const current = pendingTotalInEth.get(currentCycle, undefined);
    const previous = pendingTotalInEth.get(previousCycle, undefined);
    const currentSummed = current ? current.times(currentShareCount).div(payoutPercent || 0).times(100) : undefined;
    const previousSummed = previous ? previous.times(previousShareCount) : undefined;

    const [currentTime, setCurrentTime] = React.useState<number | null>(null);
    React.useEffect(() => {
        setCurrentTime(new Date().getTime() / 1000);
    }, [timeSinceLastEpoch]);

    return (
        <div className="overview container">
            <Stats>
                <Stat icon={<IconDarknodesOnline />} message="Darknodes online">
                    <Stats>
                        <Stat message="Registered" big>{currentDarknodeCount === null ? <Loading alt={true} /> : <>
                            {currentDarknodeCount}
                            {previousDarknodeCount !== null ? <Change className="stat--children--diff" change={currentDarknodeCount - previousDarknodeCount} /> : <></>}
                        </>}</Stat>
                        {/* <Stat message="Online" big>
                            {container.darknodeCount === null ? <Loading alt /> : <>
                                {container.darknodeCount}

                            </>}
                        </Stat> */}
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
                        {/* <Stat message="All time total" big>
                            {previousSummed ? <><CurrencyIcon currency={quoteCurrency} /><TokenBalance
                                token={Token.ETH}
                                convertTo={quoteCurrency}
                                amount={0}
                            /></> : <Loading alt />}
                        </Stat> */}
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
                                /></> : <Loading alt />}
                        </Stat>
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
                                        value={Math.min((timeSinceLastEpoch || 0) / (epochInterval || 1) * 100, 100)}
                                        text={currentTime !== null && timeUntilNextEpoch !== null ? naturalTime(currentTime + timeUntilNextEpoch, {
                                            suffix: "",
                                            message: "",
                                            countDown: true,
                                            showingSeconds: false
                                        }) : ""}
                                        // value={100}
                                        // text={currentTime !== null && timeSinceLastEpoch !== null ? naturalTime(currentTime - timeSinceLastEpoch, {
                                        //     suffix: "",
                                        //     message: "",
                                        //     countDown: false,
                                        //     showingSeconds: false
                                        // }) : ""}
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
                                {/* <p>Epochs are currently called manually</p> */}
                                <p>{currentTime !== null && timeUntilNextEpoch !== null ? naturalTime(currentTime + timeUntilNextEpoch, {
                                    suffix: "until next epoch",
                                    message: "New epoch will be called shortly",
                                    countDown: true,
                                    showingSeconds: false
                                }) : ""}</p>
                                <p>{currentTime !== null && timeSinceLastEpoch !== null ? naturalTime(currentTime - timeSinceLastEpoch, {
                                    suffix: "since last epoch",
                                    message: "Epoch called just now",
                                    countDown: false,
                                    showingSeconds: false
                                }) : ""}</p>
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
                        <ExternalLink href="https://github.com/renproject/darknode-cli"><button className="darknode-cli--button button">Download CLI</button></ExternalLink>
                    </Stat>
                </Stats>
            </div>
        </div>
    );
};
