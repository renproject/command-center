import { Currency } from "@renproject/react-components";
import Axios from "axios";
import { Map, OrderedMap } from "immutable";

import { DEFAULT_REQUEST_TIMEOUT } from "../react/environmentVariables";

export enum Token {
    ETH = "ETH",

    // Used to calculate REN bond value.
    REN = "REN",

    // Fee tokens.
    BTC = "BTC",
    ZEC = "ZEC",
    BCH = "BCH",
    FIL = "FIL",
    LUNA = "LUNA",
    DOGE = "DOGE",
    DGB = "DGB",
}

export type TokenString = string;

interface TokenDetail {
    symbol: string;
    decimals: number;
    coinGeckoID: string;
    feesToken?: boolean;
}

export const AllTokenDetails = OrderedMap<Token, TokenDetail>()
    .set(Token.ETH, {
        symbol: "ETH",
        decimals: 18,
        coinGeckoID: "ethereum",
    })
    .set(Token.REN, {
        symbol: "REN",
        decimals: 18,
        coinGeckoID: "republic-protocol",
    })
    .set(Token.BTC, {
        symbol: "BTC",
        decimals: 8,
        coinGeckoID: "bitcoin",
        feesToken: true,
    })
    .set(Token.ZEC, {
        symbol: "ZEC",
        decimals: 8,
        coinGeckoID: "zcash",
        feesToken: true,
    })
    .set(Token.BCH, {
        symbol: "BCH",
        decimals: 8,
        coinGeckoID: "bitcoin-cash",
        feesToken: true,
    })
    .set(Token.FIL, {
        symbol: "FIL",
        decimals: 18,
        coinGeckoID: "filecoin",
        feesToken: true,
    })
    .set(Token.LUNA, {
        symbol: "LUNA",
        decimals: 6,
        coinGeckoID: "terra-luna",
        feesToken: true,
    })
    .set(Token.DOGE, {
        symbol: "DOGE",
        decimals: 8, // this was 18
        coinGeckoID: "dogecoin",
        feesToken: true,
    })
    .set(Token.DGB, {
        symbol: "DGB",
        decimals: 8, // this was 18
        coinGeckoID: "digibyte",
        feesToken: true,
    })

export const FeeTokens: OrderedMap<Token, TokenDetail> = AllTokenDetails.filter(
    (details) => details.feesToken,
);

const coinGeckoURL = `https://api.coingecko.com/api/v3`;
const coinGeckoParams = `localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
export const getPrices = async (
    previousTokenPrices: TokenPrices | null,
): Promise<TokenPrices> =>
    AllTokenDetails.toArray()
        .map(([token, tokenDetails]) => ({
            token,
            responsePromise: Axios.get(
                `${coinGeckoURL}/coins/${tokenDetails.coinGeckoID}?${coinGeckoParams}`,
                { timeout: DEFAULT_REQUEST_TIMEOUT },
            ),
        }))
        .reduce(async (pricesPromise, { token, responsePromise }) => {
            let prices = await pricesPromise;
            try {
                const price = Map<Currency, number>(
                    (await responsePromise).data.market_data.current_price,
                );
                prices = prices.set(token, price);
            } catch (error) {
                const previousPrice =
                    previousTokenPrices && previousTokenPrices.get(token);
                if (previousPrice) {
                    prices = prices.set(token, previousPrice);
                }
                console.error(error);
            }
            return prices;
        }, Promise.resolve(OrderedMap<Token, Map<Currency, number>>()));

export type TokenPrices = OrderedMap<Token, Map<Currency, number>>;

export const tokenFeeDivisorPower = OrderedMap<Token, number>()
    .set(Token.LUNA, 5)