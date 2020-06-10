import { ApolloClient, gql } from "apollo-boost";
import BigNumber from "bignumber.js";

import { SECONDS } from "../../../components/common/BackgroundTasks";
import { Ox } from "../../ethereum/contractReads";

export interface Epoch {
    epochhash: string;
    timestamp: BigNumber;


    rewardShareBTC: BigNumber;
    rewardShareZEC: BigNumber;
    rewardShareBCH: BigNumber;
}

export interface RawRenVM {
    "__typename": "Integrator";
    numberOfDarknodes: string;
    numberOfDarknodesLastEpoch: string;
    numberOfDarknodesNextEpoch: string;
    minimumBond: string;
    minimumEpochInterval: string;
    currentCyclePayoutPercent: string;
    totalTxCountBTC: string;
    totalLockedBTC: string;
    totalVolumeBTC: string;
    totalTxCountZEC: string;
    totalLockedZEC: string;
    totalVolumeZEC: string;
    totalTxCountBCH: string;
    totalLockedBCH: string;
    totalVolumeBCH: string;
    currentEpoch: {
        epochhash: string;
        timestamp: string;
        rewardShareBTC: string;
        rewardShareZEC: string;
        rewardShareBCH: string;
    };
    previousEpoch: {
        epochhash: string;
        timestamp: string;
        rewardShareBTC: string;
        rewardShareZEC: string;
        rewardShareBCH: string;
    };
    currentCycle: string;
    previousCycle: string;
    deregistrationInterval: string;
}

export interface RenVM {
    numberOfDarknodes: BigNumber;
    numberOfDarknodesLastEpoch: BigNumber;
    numberOfDarknodesNextEpoch: BigNumber;
    minimumBond: BigNumber;
    minimumEpochInterval: BigNumber;
    currentCyclePayoutPercent: BigNumber;
    totalTxCountBTC: BigNumber;
    totalLockedBTC: BigNumber;
    totalVolumeBTC: BigNumber;
    totalTxCountZEC: BigNumber;
    totalLockedZEC: BigNumber;
    totalVolumeZEC: BigNumber;
    totalTxCountBCH: BigNumber;
    totalLockedBCH: BigNumber;
    totalVolumeBCH: BigNumber;
    currentEpoch: Epoch;
    previousEpoch: Epoch;
    timeUntilNextEpoch: BigNumber;
    timeSinceLastEpoch: BigNumber;
    currentCycle: string;
    previousCycle: string;
    deregistrationInterval: BigNumber;
}

export const QUERY_RENVM = gql`
  query getRenVM {
    renVM(id: "1") {
      numberOfDarknodes
      numberOfDarknodesLastEpoch
      numberOfDarknodesNextEpoch
      minimumBond
      minimumEpochInterval
      currentCyclePayoutPercent
      deregistrationInterval
      totalTxCountBTC
      totalLockedBTC
      totalVolumeBTC
      totalTxCountZEC
      totalLockedZEC
      totalVolumeZEC
      totalTxCountBCH
      totalLockedBCH
      totalVolumeBCH
      currentEpoch {
        epochhash
        timestamp
        rewardShareBTC
        rewardShareZEC
        rewardShareBCH
      }
      previousEpoch {
        epochhash
        timestamp
        rewardShareBTC
        rewardShareZEC
        rewardShareBCH
      }
      currentCycle
      previousCycle
    }
  }
  `;

export const queryRenVM = async (client: ApolloClient<object>): Promise<RenVM> => {
    const response = await client
        .query<{ renVM: RawRenVM }>({
            query: QUERY_RENVM,
        });

    const newMinimumEpochInterval = new BigNumber(response.data.renVM.minimumEpochInterval);

    const currentEpoch = {
        epochhash: Ox(new BigNumber(response.data.renVM.currentEpoch.epochhash)),
        timestamp: new BigNumber(response.data.renVM.currentEpoch.timestamp),
        rewardShareBTC: new BigNumber(response.data.renVM.currentEpoch.rewardShareBTC),
        rewardShareZEC: new BigNumber(response.data.renVM.currentEpoch.rewardShareZEC),
        rewardShareBCH: new BigNumber(response.data.renVM.currentEpoch.rewardShareBCH),
    };

    const previousEpoch = {
        epochhash: Ox(new BigNumber(response.data.renVM.previousEpoch.epochhash)),
        timestamp: new BigNumber(response.data.renVM.previousEpoch.timestamp),
        rewardShareBTC: new BigNumber(response.data.renVM.currentEpoch.rewardShareBTC),
        rewardShareZEC: new BigNumber(response.data.renVM.currentEpoch.rewardShareZEC),
        rewardShareBCH: new BigNumber(response.data.renVM.currentEpoch.rewardShareBCH),
    };

    const now = Math.floor(new Date().getTime() / SECONDS);
    const timeUntilNextEpoch = BigNumber.max(newMinimumEpochInterval.minus((new BigNumber(now).minus(currentEpoch.timestamp))), 0);
    const timeSinceLastEpoch = BigNumber.max(new BigNumber(now).minus(currentEpoch.timestamp), 0);

    return {
        minimumBond: new BigNumber(response.data.renVM.minimumBond),
        minimumEpochInterval: newMinimumEpochInterval,
        numberOfDarknodes: new BigNumber(response.data.renVM.numberOfDarknodes),
        numberOfDarknodesLastEpoch: new BigNumber(response.data.renVM.numberOfDarknodesLastEpoch),
        numberOfDarknodesNextEpoch: new BigNumber(response.data.renVM.numberOfDarknodesNextEpoch),
        currentCyclePayoutPercent: new BigNumber(response.data.renVM.currentCyclePayoutPercent),
        totalLockedBCH: new BigNumber(response.data.renVM.totalLockedBCH),
        totalLockedBTC: new BigNumber(response.data.renVM.totalLockedBTC),
        totalLockedZEC: new BigNumber(response.data.renVM.totalLockedZEC),
        totalTxCountBCH: new BigNumber(response.data.renVM.totalTxCountBCH),
        totalTxCountBTC: new BigNumber(response.data.renVM.totalTxCountBTC),
        totalTxCountZEC: new BigNumber(response.data.renVM.totalTxCountZEC),
        totalVolumeBCH: new BigNumber(response.data.renVM.totalVolumeBCH),
        totalVolumeBTC: new BigNumber(response.data.renVM.totalVolumeBTC),
        totalVolumeZEC: new BigNumber(response.data.renVM.totalVolumeZEC),
        timeUntilNextEpoch,
        timeSinceLastEpoch,
        currentEpoch,
        previousEpoch,
        currentCycle: Ox(new BigNumber(response.data.renVM.currentCycle)),
        previousCycle: Ox(new BigNumber(response.data.renVM.previousCycle)),
        deregistrationInterval: new BigNumber(response.data.renVM.deregistrationInterval),
    };
};
