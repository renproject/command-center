import { ApolloClient, gql } from "@apollo/react-hooks";
import BigNumber from "bignumber.js";
import { OrderedMap } from "immutable";
import { toChecksumAddress } from "web3-utils";

import { Ox } from "../../ethereum/contractReads";
import { TokenString } from "../../ethereum/tokens";
import { parseTokenAmount, RawTokenAmount, TokenAmount } from "./queries";
import { tokenArrayToMap } from "../volumes";

interface RawDarknode {
    __typename: "Darknode";
    deregisteredAt: string;
    id: string;
    operator: string;
    publicKey: string;
    registeredAt: string;
    lastClaimedEpoch: string;
    previousLastClaimedEpoch: string;
    balances: Array<RawTokenAmount>;
}

export interface Darknode {
    id: string;
    operator: string;
    publicKey: string;
    registeredAt: BigNumber;
    deregisteredAt: BigNumber;
    lastClaimedEpoch: string;
    previousLastClaimedEpoch: string;
    balances: OrderedMap<TokenString, TokenAmount>;
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
            balances {
                symbol
                amount
                amountInEth
                amountInUsd
                asset {
                    decimals
                    tokenAddress
                }
            }
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

        balances: tokenArrayToMap(response.data.darknode.balances).map(
            parseTokenAmount,
        ),
    };
};
