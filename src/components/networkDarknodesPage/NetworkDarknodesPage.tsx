import { CurrencyIcon, Loading, naturalTime } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import React from "react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";

import { Token } from "../../lib/ethereum/tokens";
import { isDefined } from "../../lib/general/isDefined";
import { GithubAPIContainer } from "../../store/githubApiStore";
import { GraphContainer } from "../../store/graphStore";
import { NetworkContainer } from "../../store/networkContainer";
import {
    ReactComponent as IconDarknodesOnline,
} from "../../styles/images/icon-darknodes-online.svg";
import { ReactComponent as IconIncome } from "../../styles/images/icon-income.svg";
import { ReactComponent as RewardsIcon } from "../../styles/images/icon-rewards-white.svg";
import { SECONDS } from "../common/BackgroundTasks";
import { Change } from "../common/Change";
import { ExternalLink } from "../common/ExternalLink";
import { Stat, Stats } from "../common/Stat";
import { TokenBalance } from "../common/TokenBalance";
import { DarknodeMap } from "./darknodeMap/DarknodeMap";

const REN_TOTAL_SUPPLY = new BigNumber(1000000000);

export const NetworkDarknodesPage = () => {
    const { renVM } = GraphContainer.useContainer();
    const { currentCycle, previousCycle, numberOfDarknodes, numberOfDarknodesLastEpoch, numberOfDarknodesNextEpoch, minimumBond, timeUntilNextEpoch, timeSinceLastEpoch, minimumEpochInterval } = renVM || {};
    const { pendingTotalInEth, quoteCurrency } = NetworkContainer.useContainer();
    const { latestCLIVersion, latestCLIVersionDaysAgo } = GithubAPIContainer.useContainer();

    const current = currentCycle && pendingTotalInEth.get(currentCycle, undefined);
    const previous = previousCycle && pendingTotalInEth.get(previousCycle, undefined);
    const currentSummed = current && numberOfDarknodes ? current.times(numberOfDarknodes) : undefined;
    const previousSummed = previous && numberOfDarknodesLastEpoch ? previous.times(numberOfDarknodesLastEpoch) : undefined;

    const [currentTime, setCurrentTime] = React.useState<BigNumber | null>(null);
    React.useEffect(() => {
        setCurrentTime(new BigNumber(new Date().getTime() / SECONDS));
    }, [timeSinceLastEpoch]);

    const percent = numberOfDarknodes && minimumBond ? numberOfDarknodes.times(minimumBond.div(new BigNumber(10).exponentiatedBy(18))).div(REN_TOTAL_SUPPLY).times(100).toNumber() : null;

    return (
        <div className="overview container">
            <Stats>
                <Stat icon={<IconDarknodesOnline />} message="Darknodes online">
                    <Stats>
                        <Stat message="Registered" big>{isDefined(numberOfDarknodes) ? <>
                            {numberOfDarknodes.toNumber()}
                            {isDefined(numberOfDarknodesLastEpoch) ? <Change className="stat--children--diff" change={numberOfDarknodes.minus(numberOfDarknodesLastEpoch).toNumber()} /> : <></>}
                        </> : <Loading alt={true} />}</Stat>
                        <Stat message="Change next epoch" big>{isDefined(numberOfDarknodesNextEpoch) && isDefined(numberOfDarknodes) ? <>
                            <Change change={numberOfDarknodesNextEpoch.minus(numberOfDarknodes).toNumber()} />
                        </> : <Loading alt={true} />}</Stat>
                        <Stat message="% Ren Bonded" big>{isDefined(percent) ? <>
                            {percent}%
                        </> : <Loading alt={true} />}</Stat>
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
                    <Stat
                        message="Reward Period/EPOCH Ends"
                        highlight={true}
                        nested={true}
                        infoLabel={<>An epoch is a recurring period of 30 days used for Darknode registration and for distributing rewards to Darknodes that have been active for that entire epoch.</>}
                    >
                        <div className="epoch--block--charts epoch--block--charts--small">
                            <div className="resources--chart--and--label">
                                <div className="epoch-chart--small">
                                    <CircularProgressbar
                                        value={BigNumber.min((timeSinceLastEpoch || new BigNumber(0)).div(minimumEpochInterval || new BigNumber(1)).times(100), 100).toNumber()}
                                        text={isDefined(currentTime) && isDefined(timeUntilNextEpoch) ? naturalTime(currentTime.plus(timeUntilNextEpoch).toNumber(), {
                                            suffix: "",
                                            message: "",
                                            countDown: true,
                                            showingSeconds: false
                                        }) : ""}
                                        // value={100}
                                        // text={isDefined(currentTime) && isDefined(timeSinceLastEpoch) ? naturalTime(currentTime - timeSinceLastEpoch, {
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
                                <p>{isDefined(currentTime) && isDefined(timeUntilNextEpoch) ? naturalTime(currentTime.plus(timeUntilNextEpoch).toNumber(), {
                                    suffix: "until next epoch",
                                    message: "New epoch will be called shortly",
                                    countDown: true,
                                    showingSeconds: false
                                }) : ""}</p>
                                <p>{isDefined(currentTime) && isDefined(timeSinceLastEpoch) ? naturalTime(currentTime.minus(timeSinceLastEpoch).toNumber(), {
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
