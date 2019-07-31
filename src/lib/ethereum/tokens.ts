import { Currency } from "@renproject/react-components";
import Axios from "axios";
import { Map } from "immutable";

export enum Token {
    DAI = "DAI",
    ETH = "ETH",
    BTC = "BTC",
    ZEC = "ZEC",
}

export enum OldToken {
    ETH = "ETH",
    DGX = "DGX",
    TUSD = "TUSD",
    REN = "REN",
    ZRX = "ZRX",
    OMG = "OMG",
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
}

// TODO: Switch on network
export const AllTokenDetails = Map<Token | OldToken, TokenDetail<Token | OldToken>>()
    .set(Token.DAI,
        {
            symbol: Token.DAI,
            name: "Dai",
            decimals: 18,
            wrapped: false,
            coinGeckoID: "dai",
            old: false,
            blockchain: Token.ETH
        })
    .set(Token.ETH,
        {
            symbol: Token.ETH,
            name: "Ethereum",
            decimals: 18,
            wrapped: false,
            coinGeckoID: "ethereum",
            old: false,
            blockchain: Token.ETH
        })
    .set(Token.BTC,
        {
            symbol: Token.BTC,
            name: "Bitcoin",
            decimals: 8,
            wrapped: true,
            coinGeckoID: "bitcoin",
            old: false,
            blockchain: Token.BTC
        })
    .set(Token.ZEC,
        {
            symbol: Token.ZEC,
            name: "ZCash",
            decimals: 8,
            wrapped: true,
            coinGeckoID: "zcash",
            old: false,
            blockchain: Token.ZEC
        })
    .set(OldToken.ETH,
        {
            symbol: OldToken.ETH,
            name: "Eth",
            decimals: 18,
            wrapped: false,
            coinGeckoID: "ethereum",
            old: true,
            blockchain: Token.ETH
        })
    .set(OldToken.DGX,
        {
            symbol: OldToken.DGX,
            name: "Dgx",
            decimals: 9,
            wrapped: false,
            coinGeckoID: "digix-gold",
            old: true,
            blockchain: Token.ETH
        })
    .set(OldToken.REN,
        {
            symbol: OldToken.REN,
            name: "Ren",
            decimals: 18,
            wrapped: false,
            coinGeckoID: "republic-protocol",
            old: true,
            blockchain: Token.ETH
        })
    .set(OldToken.TUSD,
        {
            symbol: OldToken.TUSD,
            name: "Tusd",
            decimals: 18,
            wrapped: false,
            coinGeckoID: "true-usd",
            old: true,
            blockchain: Token.ETH
        })
    .set(OldToken.OMG,
        {
            symbol: OldToken.OMG,
            name: "Omg",
            decimals: 18,
            wrapped: false,
            coinGeckoID: "omisego",
            old: true,
            blockchain: Token.ETH
        })
    .set(OldToken.ZRX,
        {
            symbol: OldToken.ZRX,
            name: "Zrx",
            decimals: 18,
            wrapped: false,
            coinGeckoID: "0x",
            old: true,
            blockchain: Token.ETH
        })
    ;

// tslint:disable-next-line:  no-unnecessary-type-assertion
export const OldTokenDetails = AllTokenDetails.filter((details) => details.old) as Map<OldToken, TokenDetail<OldToken>>;
// tslint:disable-next-line:  no-unnecessary-type-assertion
export const NewTokenDetails = AllTokenDetails.filter((details) => !details.old) as Map<Token, TokenDetail<Token>>;

const coinGeckoURL = `https://api.coingecko.com/api/v3`;
const coinGeckoParams = `localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
export const getPrices = async (): Promise<TokenPrices> => {

    let prices: TokenPrices = Map();

    for (const [token, tokenDetails] of AllTokenDetails.toArray()) {
        const response = await Axios.get(
            `${coinGeckoURL}/coins/${tokenDetails.coinGeckoID}?${coinGeckoParams}`
        );
        const price = Map<Currency, number>(response.data.market_data.current_price);

        prices = prices.set(token, price);
    }

    return prices;
};

export type TokenPrices = Map<Token | OldToken, Map<Currency, number>>;
