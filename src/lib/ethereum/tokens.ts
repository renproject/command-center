import Axios from "axios";

import { Map } from "immutable";

import { Currency, TokenPrices } from "../../store/types";

export enum Token {
    DAI = "DAI",
    ETH = "ETH",
    BTC = "BTC",
    ZEC = "ZEC",
}

export enum OldToken {
    ETH = "ETH (old)",
    DGX = "DGX (old)",
    TUSD = "TUSD (old)",
    REN = "REN (old)",
    ZRX = "ZRX (old)",
    OMG = "OMG (old)",
}

// TODO: Switch on network
export const RENAddress = "0x2cd647668494c1b15743ab283a0f980d90a87394"; // FIXME

export interface TokenDetail<T extends Token | OldToken> {
    address: string;
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
    .set(Token.DAI, { symbol: Token.DAI, name: "Dai", decimals: 18, address: "0xc4375b7de8af5a38a93548eb8453a498222c4ff2", wrapped: false, coinGeckoID: "dai", old: false, blockchain: Token.ETH })
    .set(Token.ETH, { symbol: Token.ETH, name: "Ethereum", decimals: 18, address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", wrapped: false, coinGeckoID: "ethereum", old: false, blockchain: Token.ETH })
    .set(Token.BTC, { symbol: Token.BTC, name: "Bitcoin", decimals: 8, address: "0x2a8368d2a983a0aeae8da0ebc5b7c03a0ea66b37", wrapped: true, coinGeckoID: "bitcoin", old: false, blockchain: Token.BTC })
    .set(Token.ZEC, { symbol: Token.ZEC, name: "ZCash", decimals: 8, address: "0xd67256552f93b39ac30083b4b679718a061feae6", wrapped: true, coinGeckoID: "zcash", old: false, blockchain: Token.ZEC })
    .set(OldToken.ETH, { symbol: OldToken.ETH, name: "Eth", decimals: 18, address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", wrapped: false, coinGeckoID: "ethereum", old: true, blockchain: Token.ETH })
    .set(OldToken.DGX, { symbol: OldToken.DGX, name: "Dgx", decimals: 9, address: "0x7d6D31326b12B6CBd7f054231D47CbcD16082b71", wrapped: false, coinGeckoID: "digix-gold", old: true, blockchain: Token.ETH })
    .set(OldToken.REN, { symbol: OldToken.REN, name: "Ren", decimals: 18, address: "0x2cd647668494c1b15743ab283a0f980d90a87394", wrapped: false, coinGeckoID: "republic-protocol", old: true, blockchain: Token.ETH })
    .set(OldToken.TUSD, { symbol: OldToken.TUSD, name: "Tusd", decimals: 18, address: "0x525389752ffe6487d33EF53FBcD4E5D3AD7937a0", wrapped: false, coinGeckoID: "true-usd", old: true, blockchain: Token.ETH })
    .set(OldToken.OMG, { symbol: OldToken.OMG, name: "Omg", decimals: 18, address: "0x66497ba75dD127b46316d806c077B06395918064", wrapped: false, coinGeckoID: "omisego", old: true, blockchain: Token.ETH })
    .set(OldToken.ZRX, { symbol: OldToken.ZRX, name: "Zrx", decimals: 18, address: "0x6EB628dCeFA95802899aD3A9EE0C7650Ac63d543", wrapped: false, coinGeckoID: "0x", old: true, blockchain: Token.ETH })
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
