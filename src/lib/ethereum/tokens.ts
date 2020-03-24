import { Currency } from "@renproject/react-components";
import Axios from "axios";
import { isMainnetAddress, isTestnetAddress } from "bchaddrjs";
import { Map, OrderedMap } from "immutable";
import { validate } from "wallet-address-validator";

export enum Token {
    DAI = "DAI",
    ETH = "ETH",
    BTC = "BTC",
    ZEC = "ZEC",
    BCH = "BCH",
}

export enum OldToken {
    ETH = "Old_ETH",
    DGX = "Old_DGX",
    TUSD = "TOld_USD",
    REN = "Old_REN",
    ZRX = "Old_ZRX",
    OMG = "Old_OMG",
}

interface TokenDetail<T extends Token | OldToken> {
    name: string;
    // tslint:disable-next-line: no-reserved-keywords
    symbol: T;
    decimals: number;
    wrapped: boolean;
    coinGeckoID: string;
    old: boolean;

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

// TODO: Switch on network
export const AllTokenDetails = OrderedMap<Token | OldToken, TokenDetail<Token | OldToken>>()
    .set(Token.BTC,
        {
            symbol: Token.BTC,
            name: "Bitcoin",
            decimals: 8,
            wrapped: true,
            coinGeckoID: "bitcoin",
            old: false,
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
            old: false,
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
            old: false,
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
            old: false,
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
            old: false,
            blockchain: Token.ETH,
            validator: ethValidator,
        })
    // Old tokens
    .set(OldToken.ETH,
        {
            symbol: OldToken.ETH,
            name: "Eth",
            decimals: 18,
            wrapped: false,
            coinGeckoID: "ethereum",
            old: true,
            blockchain: Token.ETH,
            validator: ethValidator,
        })
    .set(OldToken.DGX,
        {
            symbol: OldToken.DGX,
            name: "Dgx",
            decimals: 9,
            wrapped: false,
            coinGeckoID: "digix-gold",
            old: true,
            blockchain: Token.ETH,
            validator: ethValidator,
        })
    .set(OldToken.REN,
        {
            symbol: OldToken.REN,
            name: "Ren",
            decimals: 18,
            wrapped: false,
            coinGeckoID: "republic-protocol",
            old: true,
            blockchain: Token.ETH,
            validator: ethValidator,
        })
    .set(OldToken.TUSD,
        {
            symbol: OldToken.TUSD,
            name: "Tusd",
            decimals: 18,
            wrapped: false,
            coinGeckoID: "true-usd",
            old: true,
            blockchain: Token.ETH,
            validator: ethValidator,
        })
    .set(OldToken.OMG,
        {
            symbol: OldToken.OMG,
            name: "Omg",
            decimals: 18,
            wrapped: false,
            coinGeckoID: "omisego",
            old: true,
            blockchain: Token.ETH,
            validator: ethValidator,
        })
    .set(OldToken.ZRX,
        {
            symbol: OldToken.ZRX,
            name: "Zrx",
            decimals: 18,
            wrapped: false,
            coinGeckoID: "0x",
            old: true,
            blockchain: Token.ETH,
            validator: ethValidator,
        })
    ;

// tslint:disable-next-line:  no-unnecessary-type-assertion
export const OldTokenDetails = AllTokenDetails.filter((details) => details.old) as OrderedMap<OldToken, TokenDetail<OldToken>>;
// tslint:disable-next-line:  no-unnecessary-type-assertion
export const NewTokenDetails = AllTokenDetails.filter((details) => !details.old) as OrderedMap<Token, TokenDetail<Token>>;

const coinGeckoURL = `https://api.coingecko.com/api/v3`;
const coinGeckoParams = `localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
export const getPrices = (): Promise<TokenPrices> =>
    AllTokenDetails.toArray().map(([token, tokenDetails]) =>
        ({
            token, responsePromise: Axios.get(
                `${coinGeckoURL}/coins/${tokenDetails.coinGeckoID}?${coinGeckoParams}`
            )
        }))
        .reduce(async (pricesPromise, { token, responsePromise }) => {
            let prices = await pricesPromise;
            try {
                const price = Map<Currency, number>((await responsePromise).data.market_data.current_price);
                prices = prices.set(token, price);
            } catch (error) {
                console.error(error);
            }
            return prices;
        }, Promise.resolve(OrderedMap<Token | OldToken, Map<Currency, number>>()));

export type TokenPrices = OrderedMap<Token | OldToken, Map<Currency, number>>;
