import { ApolloClient, gql } from "@apollo/react-hooks";
import BigNumber from "bignumber.js";
import { OrderedMap } from "immutable";
import { toChecksumAddress } from "web3-utils";

import { Ox } from "../../ethereum/contractReads";
import { TokenString } from "../../ethereum/tokens";
import { tokenArrayToMap } from "../volumes";
import { parseTokenAmount, RawTokenAmount, TokenAmount } from "./queries";

interface RawDarknode {
    deregisteredAt: string;
    id: string;
    operator: string;
    registeredAt: string;
    lastClaimedEpoch: string;
    previousLastClaimedEpoch: string;
    balances: RawTokenAmount[];
}

export interface Darknode {
    id: string;
    operator: string;
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
    console.log("darknode", darknodeID, response);
    if (!response.data.darknode) {
        return null;
    }

    return {
        id: darknodeID,
        operator: toChecksumAddress(response.data.darknode.operator),
        registeredAt: new BigNumber(response.data.darknode.registeredAt),
        deregisteredAt: new BigNumber(response.data.darknode.deregisteredAt),
        lastClaimedEpoch: Ox(
            new BigNumber(response.data.darknode.lastClaimedEpoch),
        ),
        previousLastClaimedEpoch: Ox(
            new BigNumber(response.data.darknode.previousLastClaimedEpoch),
        ),
        // TODO: fees darknode balances (withdrawable/pending) are here
        balances: tokenArrayToMap(response.data.darknode.balances).map(
            parseTokenAmount,
        ),
    };
};
