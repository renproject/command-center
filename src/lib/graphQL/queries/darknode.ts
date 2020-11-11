import { ApolloClient, gql } from "apollo-boost";
import BigNumber from "bignumber.js";
import { toChecksumAddress } from "web3-utils";

import { Ox } from "../../ethereum/contractReads";

interface RawDarknode {
    __typename: "Darknode";
    deregisteredAt: string;
    id: string;
    operator: string;
    publicKey: string;
    registeredAt: string;
    lastClaimedEpoch: string;
    previousLastClaimedEpoch: string;
    balanceBTC: string;
    balanceZEC: string;
    balanceBCH: string;
}

export interface Darknode {
    id: string;
    operator: string;
    publicKey: string;
    registeredAt: BigNumber;
    deregisteredAt: BigNumber;
    lastClaimedEpoch: string;
    previousLastClaimedEpoch: string;
    balanceBTC: BigNumber;
    balanceZEC: BigNumber;
    balanceBCH: BigNumber;
}

const QUERY_DARKNODE = gql`
    query getDarknode($darknodeID: Bytes) {
        darknode(id: $darknodeID) {
            id
            operator
            publicKey
            registeredAt
            deregisteredAt
            lastClaimedEpoch
            previousLastClaimedEpoch
            balanceBTC
            balanceZEC
            balanceBCH
        }
    }
`;

export const queryDarknode = async (
    client: ApolloClient<object>,
    darknodeID: string,
): Promise<Darknode | null> => {
    const response = await client.query<{ darknode: RawDarknode | null }>({
        query: QUERY_DARKNODE,
        variables: {
            darknodeID: darknodeID.toLowerCase(),
        },
    });

    if (!response.data.darknode) {
        return null;
    }

    return {
        id: darknodeID,
        operator: toChecksumAddress(response.data.darknode.operator),
        publicKey: response.data.darknode.publicKey,
        registeredAt: new BigNumber(response.data.darknode.registeredAt),
        deregisteredAt: new BigNumber(response.data.darknode.deregisteredAt),
        lastClaimedEpoch: Ox(
            new BigNumber(response.data.darknode.lastClaimedEpoch),
        ),
        previousLastClaimedEpoch: Ox(
            new BigNumber(response.data.darknode.previousLastClaimedEpoch),
        ),

        balanceBTC: new BigNumber(response.data.darknode.balanceBTC),
        balanceZEC: new BigNumber(response.data.darknode.balanceZEC),
        balanceBCH: new BigNumber(response.data.darknode.balanceBCH),
    };
};
