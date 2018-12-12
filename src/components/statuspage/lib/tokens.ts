import { Currency, TokenPrices } from "@Reducers/types";
import RenExSDK from "@renex/renex";
import { Map } from "immutable";

export enum Token {
    // BTC = 0x00000000,
    ETH = 0x00000001,
    DGX = 0x00000100,
    TUSD = 0x00000101,
    REN = 0x00010000,
    OMG = 0x00010001,
    ZRX = 0x00010002,
}

// tslint:disable-next-line:no-any
const tmpSDK = new RenExSDK((window.web3 as any).currentProvider, { network: "testnet" });

// For iterating over Tokens
export const Tokens: Token[] = [Token.ETH, Token.DGX, Token.TUSD, Token.REN, Token.OMG, Token.ZRX];

export interface TokenDetail {
    name: string;
    symbol: string;
    icon: string;
    address: string;
    digits: number;
    coingeckoID: string;
}


export let TokenDetails: Map<Token, TokenDetail> = Map();

TokenDetails = TokenDetails.set(Token.ETH, {
    name: "Ethereum",
    symbol: "ETH",
    icon: "eth.svg",
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    digits: 18,
    coingeckoID: "ethereum",
});

TokenDetails = TokenDetails.set(Token.DGX, {
    name: "Digix Gold Token",
    symbol: "DGX",
    icon: "dgx.svg",
    address: tmpSDK._networkData.tokens.DGX,
    digits: 9,
    coingeckoID: "digix-gold",
});

TokenDetails = TokenDetails.set(Token.REN, {
    name: "Republic Protocol",
    symbol: "REN",
    icon: "ren.svg",
    address: tmpSDK._networkData.tokens.REN,
    digits: 18,
    coingeckoID: "republic-protocol",
});

TokenDetails = TokenDetails.set(Token.TUSD, {
    name: "TrueUSD",
    symbol: "TUSD",
    icon: "tusd.svg",
    address: tmpSDK._networkData.tokens.TUSD,
    digits: 18,
    coingeckoID: "true-usd",
});

TokenDetails = TokenDetails.set(Token.OMG, {
    name: "OmiseGo",
    symbol: "OMG",
    icon: "omg.svg",
    address: tmpSDK._networkData.tokens.OMG,
    digits: 18,
    coingeckoID: "omisego",
});

TokenDetails = TokenDetails.set(Token.ZRX, {
    name: "0x",
    symbol: "ZRX",
    icon: "zrx.svg",
    address: tmpSDK._networkData.tokens.ZRX,
    digits: 18,
    coingeckoID: "0x",
});

export async function getPrices(): Promise<TokenPrices> {

    let prices: TokenPrices = Map();

    for (const token of Tokens) {

        const tokenDetails = TokenDetails.get(token, undefined);

        if (!tokenDetails) {
            continue;
        }

        const url = `https://api.coingecko.com/api/v3/coins/${tokenDetails.coingeckoID}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
        const response = await fetch(url);
        const data = await response.json();
        const price = Map<Currency, number>(data.market_data.current_price);

        prices = prices.set(token, price);
    }

    return prices;
}
