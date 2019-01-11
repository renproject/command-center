import * as React from "react";

import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { Token } from "../../lib/ethereum/tokens";
import { ApplicationData } from "../../reducers/types";

interface Props extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
    token: Token;
    className?: string;
}

interface State {
}

const icons = {
    [Token.ETH]: "eth.svg",
    [Token.DGX]: "dgx.svg",
    [Token.REN]: "ren.svg",
    [Token.TUSD]: "tusd.svg",
    [Token.OMG]: "omg.svg",
    [Token.ZRX]: "zrx.svg",
};

class TokenIconClass extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    public render = (): JSX.Element => {
        const { token, className } = this.props;
        const image = require(`../../tokens/${icons[token]}`);

        return <img className={className} src={image} />;
    }
}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
    }, dispatch),
});

export const TokenIcon = connect(mapStateToProps, mapDispatchToProps)(TokenIconClass);
