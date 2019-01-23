import { Map } from "immutable";

import { Currency, TokenPrices } from "../../reducers/types";

export enum Token {
    ETH = "ETH",
    DGX = "DGX",
    TUSD = "TUSD",
    REN = "REN",
    ZRX = "ZRX",
    OMG = "OMG",
}

// For iterating over Tokens
export const Tokens: Token[] = [Token.ETH, Token.DGX, Token.TUSD, Token.REN, Token.OMG, Token.ZRX];

const coinGeckoIDs = Map<Token, string>()
    .set(Token.ETH, "ethereum")
    .set(Token.DGX, "digix-gold")
    .set(Token.REN, "republic-protocol")
    .set(Token.TUSD, "true-usd")
    .set(Token.OMG, "omisego")
    .set(Token.ZRX, "0x");

export async function getPrices(): Promise<TokenPrices> {

    let prices: TokenPrices = Map();

    for (const token of Tokens) {

        const coinGeckoID = coinGeckoIDs.get(token, undefined);

        if (!coinGeckoID) {
            continue;
        }

        // tslint:disable-next-line:max-line-length
        const url = `https://api.coingecko.com/api/v3/coins/${coinGeckoID}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
        const response = await fetch(url);
        const data = await response.json();
        const price = Map<Currency, number>(data.market_data.current_price);

        prices = prices.set(token, price);
    }

    return prices;
}
