import "./styles.scss";

import * as React from "react";

import { ReactComponent as Info } from "../infoLabel/info.svg";
import { ReactComponent as ColorArbitrumChain } from "./icons/color/arbitrum-chain.svg";
import { ReactComponent as ColorAvalancheChain } from "./icons/color/avalanche-chain.svg";
// Color icons
import { ReactComponent as ColorBCH } from "./icons/color/bch.svg";
import { ReactComponent as ColorBSCChain } from "./icons/color/bsc-chain.svg";
import { ReactComponent as ColorBTC } from "./icons/color/btc.svg";
import { ReactComponent as ColorDAI } from "./icons/color/dai.svg";
import { ReactComponent as ColorDGB } from "./icons/color/dgb.svg";
import { ReactComponent as ColorDOGE } from "./icons/color/doge.svg";
import { ReactComponent as ColorEthChain } from "./icons/color/eth-chain.svg";
import { ReactComponent as ColorETH } from "./icons/color/eth.svg";
import { ReactComponent as ColorFantomChain } from "./icons/color/fantom-chain.svg";
import { ReactComponent as ColorFIL } from "./icons/color/fil.svg";
import { ReactComponent as ColorLUNA } from "./icons/color/luna.svg";
import { ReactComponent as ColorPolygonChain } from "./icons/color/polygon-chain.svg";
import { ReactComponent as ColorREN } from "./icons/color/ren.svg";
import { ReactComponent as ColorSolanaChain } from "./icons/color/solana-chain.svg";
import { ReactComponent as ColorZEC } from "./icons/color/zec.svg";
import { ReactComponent as WhiteArbETH } from "./icons/white/arbeth.svg";
import { ReactComponent as WhiteAVAX } from "./icons/white/avax.svg";
import { ReactComponent as WhiteBADGER } from "./icons/white/badger.svg";
// White icons
import { ReactComponent as WhiteBCH } from "./icons/white/bch.svg";
import { ReactComponent as WhiteBNB } from "./icons/white/bnb.svg";
import { ReactComponent as WhiteBTC } from "./icons/white/btc.svg";
import { ReactComponent as WhiteBUSD } from "./icons/white/busd.svg";
import { ReactComponent as WhiteCRV } from "./icons/white/crv.svg";
import { ReactComponent as WhiteCVX } from "./icons/white/cvx.svg";
import { ReactComponent as WhiteDAI } from "./icons/white/dai.svg";
import { ReactComponent as WhiteDGB } from "./icons/white/dgb.svg";
import { ReactComponent as WhiteDOGE } from "./icons/white/doge.svg";
import { ReactComponent as WhiteETH } from "./icons/white/eth.svg";
import { ReactComponent as WhiteEURT } from "./icons/white/eurt.svg";
import { ReactComponent as WhiteFIL } from "./icons/white/fil.svg";
import { ReactComponent as WhiteFTM } from "./icons/white/ftm.svg";
import { ReactComponent as WhiteFTT } from "./icons/white/ftt.svg";
import { ReactComponent as WhiteKNC } from "./icons/white/knc.svg";
import { ReactComponent as WhiteLINK } from "./icons/white/link.svg";
import { ReactComponent as WhiteLUNA } from "./icons/white/luna.svg";
import { ReactComponent as WhiteMATIC } from "./icons/white/matic.svg";
import { ReactComponent as WhiteMIM } from "./icons/white/mim.svg";
import { ReactComponent as WhiteREN } from "./icons/white/ren.svg";
import { ReactComponent as WhiteROOK } from "./icons/white/rook.svg";
import { ReactComponent as WhiteSUSHI } from "./icons/white/sushi.svg";
import { ReactComponent as WhiteUNI } from "./icons/white/uni.svg";
import { ReactComponent as WhiteUSDC } from "./icons/white/usdc.svg";
import { ReactComponent as WhiteUSDT } from "./icons/white/usdt.svg";
import { ReactComponent as WhiteWBTC } from "./icons/white/wbtc.svg";
import { ReactComponent as WhiteWETH } from "./icons/white/weth.svg";
import { ReactComponent as WhiteZEC } from "./icons/white/zec.svg";

const icons = {
    color: {
        BTC: ColorBTC,
        ZEC: ColorZEC,
        BCH: ColorBCH,
        DAI: ColorDAI,
        ETH: ColorETH,
        REN: ColorREN,
        DGB: ColorDGB,
        DOGE: ColorDOGE,
        FIL: ColorFIL,
        LUNA: ColorLUNA,
        EthChain: ColorEthChain,
        BSCChain: ColorBSCChain,
        FantomChain: ColorFantomChain,
        PolygonChain: ColorPolygonChain,
        AvalancheChain: ColorAvalancheChain,
        SolanaChain: ColorSolanaChain,
        ArbitrumChain: ColorArbitrumChain,
    },
    white: {
        ArbETH: WhiteArbETH,
        AVAX: WhiteAVAX,
        BADGER: WhiteBADGER,
        BCH: WhiteBCH,
        BNB: WhiteBNB,
        BTC: WhiteBTC,
        BUSD: WhiteBUSD,
        CRV: WhiteCRV,
        CVX: WhiteCVX,
        DAI: WhiteDAI,
        DGB: WhiteDGB,
        DOGE: WhiteDOGE,
        ETH: WhiteETH,
        EURT: WhiteEURT,
        FIL: WhiteFIL,
        FTM: WhiteFTM,
        FTT: WhiteFTT,
        gETH: WhiteETH,
        KNC: WhiteKNC,
        LINK: WhiteLINK,
        LUNA: WhiteLUNA,
        MATIC: WhiteMATIC,
        MIM: WhiteMIM,
        REN: WhiteREN,
        ROOK: WhiteROOK,
        SUSHI: WhiteSUSHI,
        UNI: WhiteUNI,
        USDC: WhiteUSDC,
        USDT: WhiteUSDT,
        WBTC: WhiteWBTC,
        WETH: WhiteWETH,
        ZEC: WhiteZEC,
    },
};

interface Props
    extends React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLImageElement>,
        HTMLImageElement
    > {
    token: string;
    white?: boolean;
}

export const TokenIcon = ({
    token,
    white,
    className,
    ...props
}: Props): JSX.Element =>
    React.createElement(
        icons[white ? "white" : "color"][token] ||
            // Try opposite color before falling back to default icon.
            icons[white ? "color" : "white"][token] ||
            Info,
        {
            ...props,
            className: ["token--icon", className ? className : ""].join(" "),
        },
    );
