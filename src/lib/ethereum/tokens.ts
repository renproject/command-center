import Axios from "axios";

import { Map } from "immutable";

import { Currency, TokenPrices } from "../../store/types";

export enum Token {
    DAI = "DAI",
    ETH = "ETH",
    BTC = "BTC",
    ZEC = "ZEC",
}

// TODO: Switch on network
export const RENAddress = "0x2cd647668494c1b15743ab283a0f980d90a87394"; // FIXME

export interface TokenDetails {
    address: string;
    name: string;
    // tslint:disable-next-line: no-reserved-keywords
    symbol: Token;
    decimals: number;
}

// TODO: Switch on network
export const TokenDetails = Map<Token, TokenDetails>()
    .set(Token.DAI, { symbol: Token.DAI, name: "Dai", decimals: 18, address: "0xc4375b7de8af5a38a93548eb8453a498222c4ff2", })
    .set(Token.ETH, { symbol: Token.ETH, name: "Ethereum", decimals: 18, address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", })
    .set(Token.BTC, { symbol: Token.BTC, name: "Bitcoin", decimals: 18, address: "0x2a8368d2a983a0aeae8da0ebc5b7c03a0ea66b37", })
    .set(Token.ZEC, { symbol: Token.ZEC, name: "ZCash", decimals: 18, address: "0xd67256552f93b39ac30083b4b679718a061feae6", })
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

    for (const [token, coinGeckoID] of coinGeckoIDs.toArray()) {
        const response = await Axios.get(
            `${coinGeckoURL}/coins/${coinGeckoID}?${coinGeckoParams}`
        );
        const price = Map<Currency, number>(response.data.market_data.current_price);

        prices = prices.set(token, price);
    }

    return prices;
};
