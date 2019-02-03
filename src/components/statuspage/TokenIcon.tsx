import * as React from "react";

import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators, Dispatch } from "redux";

import { Token } from "../../lib/ethereum/tokens";
import { ApplicationData } from "../../store/types";

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
        // tslint:disable-next-line: non-literal-require
        const image = require(`../../styles/images/tokens/${icons[token]}`);

        return <img alt="" role="presentation" className={className} src={image} />;
    }
}

const mapStateToProps = (_state: ApplicationData) => ({
    store: {
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
    token: Token;
    className?: string;
}

interface State {
}

export const TokenIcon = connect(mapStateToProps, mapDispatchToProps)(TokenIconClass);
