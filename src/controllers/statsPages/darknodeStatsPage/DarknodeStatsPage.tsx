import { Currency, CurrencyIcon, Loading } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import React, { useMemo } from "react";

import { isDefined } from "../../../lib/general/isDefined";
import { multiplyTokenAmount } from "../../../lib/graphQL/queries/queries";
import { GithubAPIContainer } from "../../../store/githubApiContainer";
import { GraphContainer } from "../../../store/graphContainer";
import { NetworkContainer } from "../../../store/networkContainer";
import { ReactComponent as IconDarknodesOnline } from "../../../styles/images/icon-darknodes-online.svg";
import { ReactComponent as IconIncome } from "../../../styles/images/icon-income.svg";
import { Change } from "../../../views/Change";
import { EpochProgress } from "../../../views/EpochProgress";
import { ExternalLink } from "../../../views/ExternalLink";
import { Stat, Stats } from "../../../views/Stat";
import { ConvertCurrency } from "../../common/TokenBalance";
import { DarknodeMap } from "./darknodeMap/DarknodeMap";
import { FeesStat } from "./FeesStat";

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

    // const updatedFees = useMemo(
    //     () => (fees ? updatePrices(fees, tokenPrices) : fees),
    //     [fees, tokenPrices],
    // );

    const current =
        (isDefined(currentCycle) &&
            pendingRewards.get(currentCycle, undefined)) ||
        undefined;
    const previous =
        (isDefined(previousCycle) &&
            pendingRewards.get(previousCycle, undefined)) ||
        undefined;

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

    const previousNetwork = useMemo(
        () =>
            previous && numberOfDarknodes
                ? previous.map((x) =>
                      !x ? x : multiplyTokenAmount(x, numberOfDarknodes),
                  )
                : undefined,
        [previous, numberOfDarknodes],
    );

    const currentNetwork = useMemo(
        () =>
            current && numberOfDarknodes
                ? current.map((x) =>
                      !x ? x : multiplyTokenAmount(x, numberOfDarknodes),
                  )
                : undefined,
        [current, numberOfDarknodes],
    );

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
                        {/* <FeesStat
                            fees={updatedFees}
                            feesInUsd={totalFees}
                            message="Total network fees"
                            infoLabel="The fees paid to the network across all epochs."
                            quoteCurrency={quoteCurrency}
                        /> */}
                        <Stat
                            message="Total network fees"
                            big
                            infoLabel="The fees paid to the network across all epochs, using the USD price at the time of the mint or burn."
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
                        <FeesStat
                            fees={previousNetwork}
                            feesInUsd={previousNetworkInUsd}
                            message="Last cycle"
                            infoLabel="The amount of rewards earned by the entire network of Darknodes in the last Epoch."
                            quoteCurrency={quoteCurrency}
                        />
                        <FeesStat
                            fees={currentNetwork}
                            feesInUsd={currentNetworkInUsd}
                            message="Current cycle"
                            infoLabel="Rewards earned in this current Epoch so far by the entire Darknode network."
                            quoteCurrency={quoteCurrency}
                        />
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
