import * as React from "react";

import { ReactComponent as Info } from "../infoLabel/info.svg";
// Color icons
import { ReactComponent as ColorBCH } from "./icons/color/bch.svg";
import { ReactComponent as ColorBTC } from "./icons/color/btc.svg";
import { ReactComponent as ColorDAI } from "./icons/color/dai.svg";
import { ReactComponent as ColorETH } from "./icons/color/eth.svg";
import { ReactComponent as ColorREN } from "./icons/color/ren.svg";
import { ReactComponent as ColorZEC } from "./icons/color/zec.svg";
// White icons
import { ReactComponent as WhiteBCH } from "./icons/white/bch.svg";
import { ReactComponent as WhiteBTC } from "./icons/white/btc.svg";
import { ReactComponent as WhiteDAI } from "./icons/white/dai.svg";
import { ReactComponent as WhiteDGB } from "./icons/white/dgb.svg";
import { ReactComponent as WhiteDOGE } from "./icons/white/doge.svg";
import { ReactComponent as WhiteETH } from "./icons/white/eth.svg";
import { ReactComponent as WhiteFIL } from "./icons/white/fil.svg";
import { ReactComponent as WhiteLUNA } from "./icons/white/luna.svg";
import { ReactComponent as WhiteREN } from "./icons/white/ren.svg";
import { ReactComponent as WhiteZEC } from "./icons/white/zec.svg";
import "./styles.scss";

const icons = {
    color: {
        BTC: ColorBTC,
        ZEC: ColorZEC,
        BCH: ColorBCH,
        DAI: ColorDAI,
        ETH: ColorETH,
        REN: ColorREN,
    },
    white: {
        BTC: WhiteBTC,
        ZEC: WhiteZEC,
        BCH: WhiteBCH,
        DAI: WhiteDAI,
        ETH: WhiteETH,
        REN: WhiteREN,
        LUNA: WhiteLUNA,
        FIL: WhiteFIL,
        DGB: WhiteDGB,
        DOGE: WhiteDOGE,
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
    React.createElement(icons[white ? "white" : "color"][token] || Info, {
        ...props,
        className: ["token--icon", className ? className : ""].join(" "),
    });
