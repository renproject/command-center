import { CurrencyIcon, Loading } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import React from "react";

import { Token } from "../../../lib/ethereum/tokens";
import { isDefined } from "../../../lib/general/isDefined";
import { GithubAPIContainer } from "../../../store/githubApiContainer";
import { GraphContainer } from "../../../store/graphContainer";
import { NetworkContainer } from "../../../store/networkContainer";
import { ReactComponent as IconDarknodesOnline } from "../../../styles/images/icon-darknodes-online.svg";
import { ReactComponent as IconIncome } from "../../../styles/images/icon-income.svg";
import { ReactComponent as RewardsIcon } from "../../../styles/images/icon-rewards-white.svg";
import { Change } from "../../../views/Change";
import { EpochProgress } from "../../../views/EpochProgress";
import { ExternalLink } from "../../../views/ExternalLink";
import { Stat, Stats } from "../../../views/Stat";
import { TokenBalance } from "../../common/TokenBalance";
import { DarknodeMap } from "./darknodeMap/DarknodeMap";

const REN_TOTAL_SUPPLY = new BigNumber(1000000000);

export const DarknodeStatsPage = () => {
  const { renVM } = GraphContainer.useContainer();
  const {
    currentCycle,
    previousCycle,
    numberOfDarknodes,
    numberOfDarknodesLastEpoch,
    numberOfDarknodesNextEpoch,
    minimumBond,
    timeUntilNextEpoch,
    timeSinceLastEpoch,
    minimumEpochInterval,
  } = renVM || {};
  const { pendingTotalInEth, quoteCurrency } = NetworkContainer.useContainer();
  const {
    latestCLIVersion,
    latestCLIVersionDaysAgo,
  } = GithubAPIContainer.useContainer();

  const current =
    currentCycle && pendingTotalInEth.get(currentCycle, undefined);
  const previous =
    previousCycle && pendingTotalInEth.get(previousCycle, undefined);
  const currentSummed =
    current && numberOfDarknodes ? current.times(numberOfDarknodes) : undefined;
  const previousSummed =
    previous && numberOfDarknodesLastEpoch
      ? previous.times(numberOfDarknodesLastEpoch)
      : undefined;

  const percent =
    numberOfDarknodes && minimumBond
      ? numberOfDarknodes
          .times(minimumBond.div(new BigNumber(10).exponentiatedBy(18)))
          .div(REN_TOTAL_SUPPLY)
          .times(100)
          .toNumber()
      : null;

  return (
    <div className="overview container">
      <Stats>
        <Stat icon={<IconDarknodesOnline />} message="Darknodes online">
          <Stats>
            <Stat
              message="Registered"
              big
              infoLabel="The current number of registered Darknodes. The smaller number indicates the change in registrations last Epoch."
            >
              {isDefined(numberOfDarknodes) ? (
                <>
                  {numberOfDarknodes.toNumber()}
                  {isDefined(numberOfDarknodesLastEpoch) ? (
                    <Change
                      className="stat--children--diff"
                      change={numberOfDarknodes
                        .minus(numberOfDarknodesLastEpoch)
                        .toNumber()}
                    />
                  ) : null}
                </>
              ) : (
                <Loading alt={true} />
              )}
            </Stat>
            <Stat
              message="Change next epoch"
              big
              infoLabel="The change in registrations at the beginning of the next Epoch."
            >
              {isDefined(numberOfDarknodesNextEpoch) &&
              isDefined(numberOfDarknodes) ? (
                <>
                  <Change
                    change={numberOfDarknodesNextEpoch
                      .minus(numberOfDarknodes)
                      .toNumber()}
                  />
                </>
              ) : (
                <Loading alt={true} />
              )}
            </Stat>
            <Stat
              message="% Ren Bonded"
              big
              infoLabel="Each Darknode is required to bond 100,000K REN to encourage good behaviour. This number represents the percentage of the total amount of REN (1B) which is currently bonded."
            >
              {isDefined(percent) ? <>{percent}%</> : <Loading alt={true} />}
            </Stat>
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
            <Stat
              message="Last cycle"
              big
              infoLabel="The amount of rewards earned by the entire network of Darknodes in the last epoch. "
            >
              {previousSummed ? (
                <>
                  <CurrencyIcon currency={quoteCurrency} />
                  <TokenBalance
                    token={Token.ETH}
                    convertTo={quoteCurrency}
                    amount={previousSummed}
                    format
                  />
                </>
              ) : (
                <Loading alt />
              )}
            </Stat>
            <Stat
              message="Current cycle"
              highlight={true}
              big={true}
              icon={<RewardsIcon />}
              infoLabel="Rewards earned in this current epoch so far by the entire Darknode network."
            >
              {currentSummed ? (
                <>
                  <CurrencyIcon currency={quoteCurrency} />
                  <TokenBalance
                    token={Token.ETH}
                    convertTo={quoteCurrency}
                    amount={currentSummed}
                    format
                  />
                </>
              ) : (
                <Loading alt />
              )}
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
            infoLabel={
              <>
                An epoch is a recurring period of 30 days used for Darknode
                registration and for distributing rewards to Darknodes that have
                been active for that entire epoch.
              </>
            }
          >
            <EpochProgress
              small={true}
              timeSinceLastEpoch={timeSinceLastEpoch}
              timeUntilNextEpoch={timeUntilNextEpoch}
              minimumEpochInterval={minimumEpochInterval}
            />
          </Stat>
          <Stat
            message="Darknode CLI Information"
            className="darknode-cli"
            highlight={true}
            nested={true}
          >
            <div className="darknode-cli--top">
              <p>
                Latest CLI Version <b>{latestCLIVersion}</b>
              </p>
              <p>
                Version published <b>{latestCLIVersionDaysAgo}</b>
              </p>
            </div>
            <ExternalLink href="https://github.com/renproject/darknode-cli">
              <button className="darknode-cli--button button">
                Download CLI
              </button>
            </ExternalLink>
          </Stat>
        </Stats>
      </div>
    </div>
  );
};
