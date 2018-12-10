import * as React from "react";

import { BigNumber } from "bignumber.js";

import { Token, TokenDetails } from "./lib/tokens";

interface TokenBalanceProps {
    token: Token;
    amount: string;
    min?: number;
}

interface TokenBalanceState {
}

export class TokenBalance extends React.Component<TokenBalanceProps, TokenBalanceState> {
    constructor(props: TokenBalanceProps) {
        super(props);
    }

    public render(): JSX.Element {
        // tslint:disable-next-line:no-non-null-assertion
        const token = TokenDetails.get(this.props.token)!;
        const amount = new BigNumber(this.props.amount).div(new BigNumber(Math.pow(10, token.digits)));
        const image = require(`../../tokens/${token.icon}`);
        return (
            <>
                <div className="balance">
                    <img className="balance--icon" src={image} />
                    <span className="balance--title">{token.symbol}</span>
                    <input type="text" value={amount.toFixed()} disabled />
                </div>
                {this.props.min !== undefined && amount.lte(new BigNumber(this.props.min)) &&
                    <p className="warning">Your darknode has insufficient funds to operate.</p>
                }
            </>
        );
    }
}
