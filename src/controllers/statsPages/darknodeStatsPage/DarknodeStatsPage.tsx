import { Currency, CurrencyIcon, Loading } from "@renproject/react-components";
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
import { InfoLabel } from "../../../views/infoLabel/InfoLabel";
import { Stat, Stats } from "../../../views/Stat";
import { TokenIcon } from "../../../views/tokenIcon/TokenIcon";
import { AnyTokenBalance, ConvertCurrency } from "../../common/TokenBalance";
import { DarknodeMap } from "./darknodeMap/DarknodeMap";

const REN_TOTAL_SUPPLY = new BigNumber(1000000000);

export const DarknodeStatsPage = () => {
    const { renVM } = GraphContainer.useContainer();
    const {
        currentCycle,
        previousCycle,
        numberOfDarknodes,
        numberOfDarknodesLastEpoch,
        pendingRegistrations,
        pendingDeregistrations,
        minimumBond,
        timeUntilNextEpoch,
        timeSinceLastEpoch,
        minimumEpochInterval,
        fees,
    } = renVM || {};
    const {
        pendingRewards,
        quoteCurrency,
        pendingTotalInUsd,
    } = NetworkContainer.useContainer();
    const {
        latestCLIVersion,
        latestCLIVersionDaysAgo,
    } = GithubAPIContainer.useContainer();

    const current = currentCycle && pendingRewards.get(currentCycle, undefined);
    const previous =
        previousCycle && pendingRewards.get(previousCycle, undefined);

    const percent =
        numberOfDarknodes && minimumBond
            ? numberOfDarknodes
                  .times(minimumBond.div(new BigNumber(10).exponentiatedBy(18)))
                  .div(REN_TOTAL_SUPPLY)
                  .times(100)
                  .toNumber()
            : null;

    const totalFees = fees
        ? fees.reduce(
              (sum, feeItem) => sum.plus(feeItem.amountInUsd),
              new BigNumber(0),
          )
        : null;

    const currentInUsd =
        currentCycle && pendingTotalInUsd.get(currentCycle, undefined);
    const previousInUsd =
        previousCycle && pendingTotalInUsd.get(previousCycle, undefined);
    const currentNetworkInUsd =
        currentInUsd && numberOfDarknodes
            ? currentInUsd.times(numberOfDarknodes)
            : undefined;
    const previousNetworkInUsd =
        previousInUsd && numberOfDarknodesLastEpoch
            ? previousInUsd.times(numberOfDarknodesLastEpoch)
            : undefined;

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
                                    <span className="stat-amount--value">
                                        {numberOfDarknodes.toFormat(0)}
                                    </span>
                                    {isDefined(numberOfDarknodesLastEpoch) ? (
                                        <Change
                                            className="stat--children--diff"
                                            change={numberOfDarknodes
                                                .minus(
                                                    numberOfDarknodesLastEpoch,
                                                )
                                                .toNumber()}
                                        />
                                    ) : null}
                                </>
                            ) : (
                                <Loading alt={true} />
                            )}
                        </Stat>
                        <Stat
                            message="Change next Epoch"
                            big
                            infoLabel="The change in registrations at the beginning of the next Epoch."
                        >
                            {isDefined(pendingRegistrations) &&
                            isDefined(pendingDeregistrations) ? (
                                <>
                                    <Change
                                        change={pendingRegistrations
                                            .minus(pendingDeregistrations)
                                            .toNumber()}
                                    />
                                    <Change
                                        className="stat--children--diff positive"
                                        prefix={"+"}
                                        change={pendingRegistrations.toNumber()}
                                    />
                                    <Change
                                        className="stat--children--diff negative"
                                        prefix={
                                            pendingDeregistrations.isZero()
                                                ? "-"
                                                : ""
                                        }
                                        change={new BigNumber(0)
                                            .minus(pendingDeregistrations)
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
                            infoLabel="Each Darknode is required to bond 100,000K REN to encourage good behavior. This number represents the percentage of the total amount of REN (1B) which is currently bonded."
                        >
                            {isDefined(percent) ? (
                                <>{percent}%</>
                            ) : (
                                <Loading alt={true} />
                            )}
                        </Stat>
                    </Stats>
                </Stat>
                <Stat icon={<IconIncome />} message="Network rewards">
                    <Stats>
                        <Stat
                            message="Total network fees"
                            big
                            infoLabel="The fees paid to the network across all epochs."
                            style={{ flexBasis: "0", flexGrow: 3 }}
                        >
                            {isDefined(totalFees) ? (
                                <>
                                    <CurrencyIcon currency={quoteCurrency} />
                                    <ConvertCurrency
                                        from={Currency.USD}
                                        to={quoteCurrency}
                                        amount={totalFees}
                                    />
                                </>
                            ) : (
                                <Loading alt={true} />
                            )}
                        </Stat>
                        <Stat
                            className="network-fees-stat"
                            message="Last cycle"
                            big
                            style={{ flexBasis: "0", flexGrow: 5 }}
                            infoLabel="The amount of rewards earned by the entire network of Darknodes in the last Epoch. "
                            dark={true}
                        >
                            {previous &&
                            numberOfDarknodesLastEpoch &&
                            previousNetworkInUsd ? (
                                <>
                                    <span style={{ display: "flex" }}>
                                        <CurrencyIcon
                                            currency={quoteCurrency}
                                        />
                                        {quoteCurrency === Currency.BTC ? (
                                            <AnyTokenBalance
                                                amount={previous
                                                    .get(Token.BTC, {
                                                        amount: new BigNumber(
                                                            0,
                                                        ),
                                                    })!
                                                    .amount.times(
                                                        numberOfDarknodesLastEpoch,
                                                    )}
                                                decimals={8}
                                            />
                                        ) : (
                                            <ConvertCurrency
                                                from={Currency.USD}
                                                to={quoteCurrency}
                                                amount={previousNetworkInUsd}
                                            />
                                        )}
                                    </span>
                                    <div className="network-fees">
                                        {previous
                                            .filter(
                                                (reward) =>
                                                    reward &&
                                                    reward.asset &&
                                                    reward.amount.gt(0),
                                            )
                                            .sortBy((reward) =>
                                                reward!.amountInUsd.toNumber(),
                                            )
                                            .reverse()
                                            .map((reward, symbol) => {
                                                return (
                                                    <div key={symbol}>
                                                        <TokenIcon
                                                            white={true}
                                                            token={symbol.replace(
                                                                /^ren/,
                                                                "",
                                                            )}
                                                        />
                                                        <AnyTokenBalance
                                                            amount={reward!.amount.times(
                                                                numberOfDarknodesLastEpoch,
                                                            )}
                                                            decimals={
                                                                reward!.asset!
                                                                    .decimals
                                                            }
                                                        />{" "}
                                                        {symbol}
                                                    </div>
                                                );
                                            })
                                            .valueSeq()
                                            .toArray()}
                                    </div>
                                </>
                            ) : (
                                <Loading alt />
                            )}
                        </Stat>
                        <Stat
                            className="network-fees-stat"
                            message="Current cycle"
                            dark={true}
                            big={true}
                            style={{ flexBasis: "0", flexGrow: 5 }}
                            icon={<RewardsIcon />}
                            infoLabel="Rewards earned in this current Epoch so far by the entire Darknode network."
                        >
                            {current &&
                            numberOfDarknodes &&
                            currentNetworkInUsd ? (
                                <>
                                    <span>
                                        <CurrencyIcon
                                            currency={quoteCurrency}
                                        />
                                        {quoteCurrency === Currency.BTC ? (
                                            <AnyTokenBalance
                                                amount={current
                                                    .get(Token.BTC, {
                                                        amount: new BigNumber(
                                                            0,
                                                        ),
                                                    })!
                                                    .amount.times(
                                                        numberOfDarknodes,
                                                    )}
                                                decimals={8}
                                            />
                                        ) : (
                                            <ConvertCurrency
                                                from={Currency.USD}
                                                to={quoteCurrency}
                                                amount={currentNetworkInUsd}
                                            />
                                        )}
                                    </span>
                                    <div className="network-fees">
                                        {current
                                            .filter(
                                                (reward) =>
                                                    reward &&
                                                    reward.asset &&
                                                    reward.amount.gt(0),
                                            )
                                            .sortBy((reward) =>
                                                reward!.amountInUsd.toNumber(),
                                            )
                                            .reverse()
                                            .map((reward, symbol) => {
                                                return (
                                                    <div>
                                                        <TokenIcon
                                                            white={true}
                                                            token={symbol.replace(
                                                                /^ren/,
                                                                "",
                                                            )}
                                                        />
                                                        <AnyTokenBalance
                                                            amount={reward!.amount.times(
                                                                numberOfDarknodes,
                                                            )}
                                                            decimals={
                                                                reward!.asset!
                                                                    .decimals
                                                            }
                                                        />{" "}
                                                        {symbol}
                                                    </div>
                                                );
                                            })
                                            .valueSeq()
                                            .toArray()}
                                    </div>
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
                        className="darknode-cli"
                        message="Reward Period/Epoch Ends"
                        highlight={true}
                        nested={true}
                        infoLabel={
                            <>
                                An Epoch is a recurring period of 28 days used
                                for Darknode registration and for distributing
                                rewards to Darknodes that have been active for
                                that entire Epoch.
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
                                Version published{" "}
                                <b>{latestCLIVersionDaysAgo}</b>
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
