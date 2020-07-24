import { Currency } from "@renproject/react-components";
import Axios from "axios";
import { isMainnetAddress, isTestnetAddress } from "bchaddrjs";
import { Map, OrderedMap } from "immutable";
import { validate } from "wallet-address-validator";

import { DEFAULT_REQUEST_TIMEOUT } from "../react/environmentVariables";

export enum Token {
    DAI = "DAI",
    ETH = "ETH",
    BTC = "BTC",
    ZEC = "ZEC",
    BCH = "BCH",
    REN = "REN",
}

interface TokenDetail<T extends Token> {
    name: string;
    // tslint:disable-next-line: no-reserved-keywords
    symbol: T;
    decimals: number;
    wrapped: boolean;
    coinGeckoID: string;
    feesToken: boolean;

    blockchain: Token; // Used for address validation
    validator: (address: string, isTestnet: boolean) => boolean;
}

const btcValidator = (address: string, isTestnet: boolean) => validate(address, "btc", isTestnet ? "testnet" : "prod");
const zecValidator = (address: string, isTestnet: boolean) => validate(address, "zec", isTestnet ? "testnet" : "prod");
const bchValidator = (address: string, isTestnet: boolean) => {
    try {
        return isTestnet ? isTestnetAddress(address) : isMainnetAddress(address);
    } catch (error) {
        return false;
    }
};
const ethValidator = (address: string, isTestnet: boolean) => validate(address, "eth", isTestnet ? "testnet" : "prod");

export const AllTokenDetails = OrderedMap<Token, TokenDetail<Token>>()
    .set(Token.BTC,
        {
            symbol: Token.BTC,
            name: "Bitcoin",
            decimals: 8,
            wrapped: true,
            coinGeckoID: "bitcoin",
            feesToken: true,
            blockchain: Token.BTC,
            validator: btcValidator,

        })
    .set(Token.ZEC,
        {
            symbol: Token.ZEC,
            name: "ZCash",
            decimals: 8,
            wrapped: true,
            coinGeckoID: "zcash",
            feesToken: true,
            blockchain: Token.ZEC,
            validator: zecValidator,
        })
    .set(Token.BCH,
        {
            symbol: Token.BCH,
            name: "Bitcoin Cash",
            decimals: 8,
            wrapped: true,
            coinGeckoID: "bitcoin-cash",
            feesToken: true,
            blockchain: Token.BCH,
            validator: bchValidator,
        })
    .set(Token.DAI,
        {
            symbol: Token.DAI,
            name: "Dai",
            decimals: 18,
            wrapped: false,
            coinGeckoID: "dai",
            feesToken: false,
            blockchain: Token.ETH,
            validator: ethValidator,
        })
    .set(Token.ETH,
        {
            symbol: Token.ETH,
            name: "Ethereum",
            decimals: 18,
            wrapped: false,
            coinGeckoID: "ethereum",
            feesToken: false,
            blockchain: Token.ETH,
            validator: ethValidator,
        })
    .set(Token.REN,
        {
            symbol: Token.REN,
            name: "Ren",
            decimals: 18,
            wrapped: false,
            coinGeckoID: "republic-protocol",
            feesToken: false,
            blockchain: Token.ETH,
            validator: ethValidator,
        })
    ;

// tslint:disable-next-line:  no-unnecessary-type-assertion
export const NewTokenDetails = AllTokenDetails.filter((details) => details.feesToken) as OrderedMap<Token, TokenDetail<Token>>;

const coinGeckoURL = `https://api.coingecko.com/api/v3`;
const coinGeckoParams = `localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
export const getPrices = (previousTokenPrices: TokenPrices | null): Promise<TokenPrices> =>
    AllTokenDetails.toArray().map(([token, tokenDetails]) =>
        ({
            token, responsePromise: Axios.get(
                `${coinGeckoURL}/coins/${tokenDetails.coinGeckoID}?${coinGeckoParams}`,
                { timeout: DEFAULT_REQUEST_TIMEOUT }
            )
        }))
        .reduce(async (pricesPromise, { token, responsePromise }) => {
            let prices = await pricesPromise;
            try {
                const price = Map<Currency, number>((await responsePromise).data.market_data.current_price);
                prices = prices.set(token, price);
            } catch (error) {
                const previousPrice = previousTokenPrices && previousTokenPrices.get(token);
                if (previousPrice) {
                    prices = prices.set(token, previousPrice);
                }
                console.error(error);
            }
            return prices;
        }, Promise.resolve(OrderedMap<Token, Map<Currency, number>>()));

export type TokenPrices = OrderedMap<Token, Map<Currency, number>>;
