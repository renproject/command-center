import Axios from "axios";

import { Map } from "immutable";

import { Currency, TokenPrices } from "../../store/types";

export enum Token {
    DAI = "DAI",
    ETH = "ETH",
    BTC = "BTC",
    ZEC = "ZEC",
}

export const RENAddress = "0x408"; // FIXME

export interface TokenDetails {
    address: string;
    name: string;
    // tslint:disable-next-line: no-reserved-keywords
    symbol: Token;
    decimals: number;
}

export const TokenDetails = Map<Token, TokenDetails>()
    .set(Token.DAI, { symbol: Token.DAI, name: "Dai", decimals: 18, address: "FIXME", })
    .set(Token.ETH, { symbol: Token.ETH, name: "Ethereum", decimals: 18, address: "FIXME", })
    .set(Token.BTC, { symbol: Token.BTC, name: "Bitcoin", decimals: 18, address: "FIXME", })
    .set(Token.ZEC, { symbol: Token.ZEC, name: "ZCash", decimals: 18, address: "FIXME", })
    ;

const coinGeckoIDs = Map<Token, string>()
    .set(Token.DAI, "dai")
    .set(Token.ETH, "ethereum")
    .set(Token.BTC, "bitcoin")
    .set(Token.ZEC, "zcash")
    ;

const coinGeckoURL = `https://api.coingecko.com/api/v3`;
const coinGeckoParams = `localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
export const getPrices = async (): Promise<TokenPrices> => {

    let prices: TokenPrices = Map();

    coinGeckoIDs.map(async (coinGeckoID, token) => {
        const response = await Axios.get(
            `${coinGeckoURL}/coins/${coinGeckoID}?${coinGeckoParams}`
        );
        const price = Map<Currency, number>(response.data.market_data.current_price);

        prices = prices.set(token, price);
    });

    return prices;
};
