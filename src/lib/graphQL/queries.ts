import { gql } from "@apollo/react-hooks";
import { OrderedMap } from "immutable";

/* QUERY_BLOCK **/

export const QUERY_BLOCK = gql`
    {
        renVM(id: "1") {
            activeBlock
            activeTimestamp
        }
    }
`;

export interface QueryBlockResponse {
    renVM: {
        activeBlock: string;
        activeTimestamp: string;
    };
}

/* RENVM **/

export const QUERY_RENVM_HISTORY = (
    block: number,
) => `block_${block}: renVM(id: "1", block: { number: ${block} }) {
    numberOfDarknodes
    numberOfDarknodesLastEpoch
    numberOfDarknodesNextEpoch
    minimumBond
    minimumEpochInterval
    #   currentCyclePayoutPercent
    deregistrationInterval
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

    btcMintFee
    btcBurnFee
    zecMintFee
    zecBurnFee
    bchMintFee
    bchBurnFee

    volume {
      symbol
      amount
      amountInEth
      amountInUsd
    }

    locked {
      symbol
      amount
      amountInUsd
    }
  }`;

export interface RawRenVM {
    id: string;
    numberOfDarknodes: string;
    numberOfDarknodesLastEpoch: string;
    numberOfDarknodesNextEpoch: string;
    minimumBond: string;
    minimumEpochInterval: string;
    // currentCyclePayoutPercent: string;
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

    btcMintFee: string;
    btcBurnFee: string;
    zecMintFee: string;
    zecBurnFee: string;
    bchMintFee: string;
    bchBurnFee: string;

    volume: Array<{
        symbol: string;
        amount: string;
        amountInEth: string;
        amountInUsd: string;
    }>;

    locked: Array<{
        symbol: string;
        amount: string;
        amountInUsd: string;
        // asset: {
        //     decimals: string;
        // };
    }>;
}

export interface PeriodData extends Omit<Omit<RawRenVM, "volume">, "locked"> {
    id: string; // "HOUR441028";
    date: number; // 1587700800;

    volume: OrderedMap<
        string,
        {
            symbol: string;
            amount: string;
            amountInEth: string;
            amountInUsd: string;
        }
    >;

    locked: OrderedMap<
        string,
        {
            symbol: string;
            amount: string;
            amountInUsd: string;
            // asset: {
            //     decimals: string;
            // };
        }
    >;
}

/* INTEGRATOR */

export const QUERY_INTEGRATORS_HISTORY = (
    id: string,
    block: number,
) => `  integrator_${id}: integrator(id: "${id}", block: { number: ${block} }) {
  id
  contractAddress
  txCountBTC
  lockedBTC
  volumeBTC
  txCountZEC
  lockedZEC
  volumeZEC
  txCountBCH
  lockedBCH
  volumeBCH
}`;

export interface Integrator {
    id: string; // "0x3973b2acdfac17171315e49ef19a0758b8b6f104";
    contractAddress: string; // "0x3973b2acdfac17171315e49ef19a0758b8b6f104";
    txCountBTC: string; // "12";
    lockedBTC: string; // "49469981";
    volumeBTC: string; // "49469981";
    txCountZEC: string; // "0";
    lockedZEC: string; // "0";
    volumeZEC: string; // "0";
    txCountBCH: string; // "0";
    lockedBCH: string; // "0";
    volumeBCH: string; // "0";
}

export const QUERY_INTEGRATORS = gql`
    query getIntegrators($offset: Int, $count: Int) {
        integrators(
            orderBy: volumeBTC
            orderDirection: desc
            first: $count
            skip: $offset
            where: { date: 0 }
        ) {
            id
            contractAddress
            txCountBTC
            lockedBTC
            volumeBTC
            txCountZEC
            lockedZEC
            volumeZEC
            txCountBCH
            lockedBCH
            volumeBCH
        }
    }
`;
