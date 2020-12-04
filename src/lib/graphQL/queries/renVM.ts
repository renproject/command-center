import { ApolloClient, gql } from "@apollo/react-hooks";
import BigNumber from "bignumber.js";
import { OrderedMap } from "immutable";

import { SECONDS } from "../../../controllers/common/BackgroundTasks";
import { Ox } from "../../ethereum/contractReads";
import { TokenString } from "../../ethereum/tokens";
import { parseTokenAmount, RawTokenAmount, TokenAmount } from "../queries";
import { tokenArrayToMap } from "../volumes";

export interface Epoch {
    epochhash: string;
    timestamp: BigNumber;

    rewardShares: OrderedMap<TokenString, TokenAmount>;
}

interface RawRenVM {
    __typename: "Integrator";
    numberOfDarknodes: string;
    numberOfDarknodesLastEpoch: string;
    numberOfDarknodesNextEpoch: string;
    minimumBond: string;
    minimumEpochInterval: string;
    btcMintFee: string;
    btcBurnFee: string;
    // currentCyclePayoutPercent: string;
    currentEpoch: {
        epochhash: string;
        timestamp: string;
        rewardShares: Array<RawTokenAmount>;
    };
    previousEpoch: {
        epochhash: string;
        timestamp: string;
        rewardShares: Array<RawTokenAmount>;
    };
    currentCycle: string;
    previousCycle: string;
    deregistrationInterval: string;
    fees: Array<RawTokenAmount>;
}

export interface RenVM {
    numberOfDarknodes: BigNumber;
    numberOfDarknodesLastEpoch: BigNumber;
    numberOfDarknodesNextEpoch: BigNumber;
    minimumBond: BigNumber;
    minimumEpochInterval: BigNumber;
    btcMintFee: number;
    btcBurnFee: number;
    // currentCyclePayoutPercent: BigNumber;
    currentEpoch: Epoch;
    previousEpoch: Epoch;
    timeUntilNextEpoch: BigNumber;
    timeSinceLastEpoch: BigNumber;
    currentCycle: string;
    previousCycle: string;
    deregistrationInterval: BigNumber;
    fees: OrderedMap<TokenString, TokenAmount>;
}

const QUERY_RENVM = gql`
    query getRenVM {
        renVM(id: "1") {
            numberOfDarknodes
            numberOfDarknodesLastEpoch
            numberOfDarknodesNextEpoch
            minimumBond
            minimumEpochInterval
            btcMintFee
            btcBurnFee
            #   currentCyclePayoutPercent
            deregistrationInterval
            currentEpoch {
                epochhash
                timestamp
                rewardShares {
                    symbol
                    amount
                    amountInEth
                    amountInUsd
                    asset {
                        decimals
                    }
                }
            }
            previousEpoch {
                epochhash
                timestamp
                rewardShares {
                    symbol
                    amount
                    amountInEth
                    amountInUsd
                    asset {
                        decimals
                    }
                }
            }
            currentCycle
            previousCycle

            fees {
                symbol
                amount
                amountInEth
                amountInUsd
                asset {
                    decimals
                }
            }
        }
    }
`;

export const queryRenVM = async (
    client: ApolloClient<object>,
): Promise<RenVM> => {
    const response = await client.query<{ renVM: RawRenVM }>({
        query: QUERY_RENVM,
    });

    const newMinimumEpochInterval = new BigNumber(
        response.data.renVM.minimumEpochInterval,
    );

    const currentEpoch = {
        epochhash: Ox(
            new BigNumber(response.data.renVM.currentEpoch.epochhash),
        ),
        timestamp: new BigNumber(response.data.renVM.currentEpoch.timestamp),

        rewardShares: tokenArrayToMap(
            response.data.renVM.currentEpoch.rewardShares,
        ).map(parseTokenAmount),
    };

    const previousEpoch = {
        epochhash: Ox(
            new BigNumber(response.data.renVM.previousEpoch.epochhash),
        ),
        timestamp: new BigNumber(response.data.renVM.previousEpoch.timestamp),

        rewardShares: tokenArrayToMap(
            response.data.renVM.previousEpoch.rewardShares,
        ).map(parseTokenAmount),
    };

    const now = Math.floor(new Date().getTime() / SECONDS);
    const timeUntilNextEpoch = BigNumber.max(
        newMinimumEpochInterval.minus(
            new BigNumber(now).minus(currentEpoch.timestamp),
        ),
        0,
    );
    const timeSinceLastEpoch = BigNumber.max(
        new BigNumber(now).minus(currentEpoch.timestamp),
        0,
    );

    return {
        minimumBond: new BigNumber(response.data.renVM.minimumBond),
        minimumEpochInterval: newMinimumEpochInterval,
        numberOfDarknodes: new BigNumber(response.data.renVM.numberOfDarknodes),
        numberOfDarknodesLastEpoch: new BigNumber(
            response.data.renVM.numberOfDarknodesLastEpoch,
        ),
        numberOfDarknodesNextEpoch: new BigNumber(
            response.data.renVM.numberOfDarknodesNextEpoch,
        ),
        timeUntilNextEpoch,
        timeSinceLastEpoch,
        btcMintFee: parseInt(response.data.renVM.btcMintFee, 10),
        btcBurnFee: parseInt(response.data.renVM.btcBurnFee, 10),
        currentEpoch,
        previousEpoch,
        currentCycle: Ox(new BigNumber(response.data.renVM.currentCycle)),
        previousCycle: Ox(new BigNumber(response.data.renVM.previousCycle)),
        deregistrationInterval: new BigNumber(
            response.data.renVM.deregistrationInterval,
        ),
        fees: tokenArrayToMap(response.data.renVM.fees).map(parseTokenAmount),
    };
};
