import * as React from "react";

import { faBitcoin, faEthereum } from "@fortawesome/free-brands-svg-icons";
import { faDollarSign, faEuroSign, faPoundSign, faWonSign, faYenSign } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Currency } from "../store/types";

export const CurrencyIcon: React.StatelessComponent<{
    currency: Currency,
}> = ({ currency }) => {

    // Note: Typescript will warn if the switch statement is non-exhaustive

    // tslint:disable: switch-default
    // eslint-disable-next-line
    switch (currency) {
        case Currency.AUD:
            return <FontAwesomeIcon icon={faDollarSign} />;
        case Currency.CNY:
            return <FontAwesomeIcon icon={faYenSign} />;
        case Currency.GBP:
            return <FontAwesomeIcon icon={faPoundSign} />;
        case Currency.EUR:
            return <FontAwesomeIcon icon={faEuroSign} />;
        case Currency.JPY:
            return <FontAwesomeIcon icon={faYenSign} />;
        case Currency.KRW:
            return <FontAwesomeIcon icon={faWonSign} />;
        case Currency.USD:
            return <FontAwesomeIcon icon={faDollarSign} />;
        case Currency.ETH:
            return <FontAwesomeIcon icon={faEthereum} />;
        case Currency.BTC:
            return <FontAwesomeIcon icon={faBitcoin} />;
    }
};
