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
}

export let TokenDetails: Map<Token, TokenDetail> = Map();

TokenDetails = TokenDetails.set(Token.ETH, {
    name: "Ethereum",
    symbol: "ETH",
    icon: "eth.svg",
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    digits: 18,
});

TokenDetails = TokenDetails.set(Token.DGX, {
    name: "Digix Gold Token",
    symbol: "DGX",
    icon: "dgx.svg",
    address: tmpSDK._networkData.tokens.DGX,
    digits: 9,
});

TokenDetails = TokenDetails.set(Token.REN, {
    name: "Republic Protocol",
    symbol: "REN",
    icon: "ren.svg",
    address: tmpSDK._networkData.tokens.REN,
    digits: 18,
});

TokenDetails = TokenDetails.set(Token.TUSD, {
    name: "TrueUSD",
    symbol: "TUSD",
    icon: "tusd.svg",
    address: tmpSDK._networkData.tokens.TUSD,
    digits: 18,
});

TokenDetails = TokenDetails.set(Token.OMG, {
    name: "OmiseGo",
    symbol: "OMG",
    icon: "omg.svg",
    address: tmpSDK._networkData.tokens.OMG,
    digits: 18,
});

TokenDetails = TokenDetails.set(Token.ZRX, {
    name: "0x",
    symbol: "ZRX",
    icon: "zrx.svg",
    address: tmpSDK._networkData.tokens.ZRX,
    digits: 18,
});
