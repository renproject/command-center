import * as React from "react";

import { faBitcoin, faEthereum } from "@fortawesome/free-brands-svg-icons";
import { faDollarSign } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Currency } from "../reducers/types";

export class CurrencyIcon extends React.Component<Props, State> {
    public render = (): JSX.Element => {
        const { currency } = this.props;

        switch (currency) {
            case Currency.BTC:
                return <FontAwesomeIcon icon={faBitcoin} />;
            case Currency.ETH:
                return <FontAwesomeIcon icon={faEthereum} />;
            default:
                return <FontAwesomeIcon icon={faDollarSign} />;
        }

    }
}

interface Props {
    currency: Currency;
}

interface State {
}
