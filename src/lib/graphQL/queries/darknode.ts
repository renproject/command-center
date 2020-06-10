import { ApolloClient, gql } from "apollo-boost";
import BigNumber from "bignumber.js";
import { toChecksumAddress } from "web3-utils";

interface RawDarknode {
    __typename: "Darknode";
    deregisteredAt: string;
    id: string;
    operator: string;
    publicKey: string;
    registeredAt: string;
}

export interface Darknode {
    id: string;
    operator: string;
    publicKey: string;
    registeredAt: BigNumber;
    deregisteredAt: BigNumber;
}

const QUERY_DARKNODE = gql`
  query getDarknode($darknodeID: Bytes) {
    darknode(id: $darknodeID) {
      id
      operator
      publicKey
      registeredAt
      deregisteredAt
    }
  }
  `;

export const queryDarknode = async (client: ApolloClient<object>, darknodeID: string): Promise<Darknode | null> => {
    const response = await client
        .query<{ darknode: RawDarknode | null }>({
            query: QUERY_DARKNODE,
            variables: {
                darknodeID: darknodeID.toLowerCase(),
            }
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
    };
};
