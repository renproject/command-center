import { gql } from "@apollo/react-hooks";
import BigNumber from "bignumber.js";
import { OrderedMap } from "immutable";
import { TokenString } from "../../ethereum/tokens";

/* TokenAmount */

export interface RawTokenAmount {
    symbol: string;
    amount: string;
    amountInEth: string;
    amountInUsd: string;
    asset: {
        decimals: string;
        tokenAddress?: string;
    } | null;
}

export interface TokenAmount {
    symbol: string;
    amount: BigNumber;
    amountInEth: BigNumber;
    amountInUsd: BigNumber;
    asset: {
        decimals: number;
        tokenAddress?: string;
    } | null;
}

export const parseTokenAmount = (amount: RawTokenAmount): TokenAmount => ({
    ...amount,
    asset: amount.asset
        ? {
              ...amount.asset,
              decimals: parseInt(amount.asset.decimals),
          }
        : amount.asset,
    amount: new BigNumber(amount.amount),
    amountInUsd: new BigNumber(amount.amountInUsd),
    amountInEth: new BigNumber(amount.amountInEth),
});

export const multiplyTokenAmount = (
    amount: TokenAmount,
    scalar: BigNumber,
) => ({
    ...amount,
    amount: amount.amount.times(scalar),
    amountInUsd: amount.amountInUsd.times(scalar),
    amountInEth: amount.amountInEth.times(scalar),
});

/* INTEGRATOR */

export const QUERY_INTEGRATORS_HISTORY = (
    id: string,
    block: number,
) => `  integrator_${id.replace(
    /-/,
    "_",
)}: integrator(id: "${id}", block: { number: ${block} }) {
  id
  contractAddress

  txCount {
      symbol
      value
  }

  volume {
    symbol
    amount
    amountInEth
    amountInUsd
    asset {
      decimals
    }
  }

  locked {
    symbol
    amount
    amountInUsd
    asset {
      decimals
    }
  }
}`;

export interface Integrator {
    id: string; // "0x3973b2acdfac17171315e49ef19a0758b8b6f104";
    contractAddress: string; // "0x3973b2acdfac17171315e49ef19a0758b8b6f104";
    txCount: OrderedMap<TokenString, number>;
    locked: OrderedMap<TokenString, TokenAmount>;
    volume: OrderedMap<TokenString, TokenAmount>;
}

export interface IntegratorRaw {
    id: string; // "0x3973b2acdfac17171315e49ef19a0758b8b6f104";
    contractAddress: string; // "0x3973b2acdfac17171315e49ef19a0758b8b6f104";

    txCount: Array<{
        symbol: string;
        value: number;
    }>;

    locked: RawTokenAmount[];

    volume: RawTokenAmount[];
}

export const QUERY_INTEGRATORS = gql`
    query getIntegrators($offset: Int, $count: Int) {
        integrators(
            orderBy: volumeTotalUSD
            orderDirection: desc
            first: $count
            skip: $offset
            where: { date: 0 }
        ) {
            id
            contractAddress

            txCount {
                symbol
                value
            }

            volume {
                symbol
                amount
                amountInEth
                amountInUsd
                asset {
                    decimals
                }
            }

            locked {
                symbol
                amount
                amountInUsd
                asset {
                    decimals
                }
            }
        }
    }
`;
