import * as React from "react";

import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dropdown } from "@renex/react-components";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import { bindActionCreators, Dispatch } from "redux";

import { storeQuoteCurrency } from "../store/actions/statistics/operatorActions";
import { showMobileMenu } from "../store/actions/ui/uiActions";
import { ApplicationData, currencies, Currency } from "../store/types";
import { AccountDropdown } from "./AccountDropdown";
import { CurrencyIcon } from "./CurrencyIcon";

import { ReactComponent as English } from "../styles/images/rp-flag-uk.svg";

const languageOptions = new Map()
    .set("EN",
        <><English /> English</>
    );

const getCurrencyOptions = () => {
    const options = new Map<string, React.ReactNode>();

    for (const currency of currencies) {
        options.set(currency.currency, <>
            <CurrencyIcon currency={currency.currency} />
            {" "}{currency.description}
        </>);
    }

    return options;
};

const currencyOptions = getCurrencyOptions();

/**
 * Header is a visual component providing page branding and navigation.
 */
class HeaderClass extends React.Component<Props> {
    public render = (): JSX.Element => {
        const { address, quoteCurrency } = this.props.store;

        const languageDropdownNode = <Dropdown
            key="languageDropdown"
            selected={{
                value: "EN",
                render: "English",
            }}
            options={languageOptions}
            setValue={this.setLanguage}
        />;

        const currencyDropdownNode = <Dropdown
            key="currencyDropdown"
            selected={{
                value: quoteCurrency,
                render: <>
                    <CurrencyIcon currency={quoteCurrency} />
                    {" "}{quoteCurrency.toUpperCase()}
                </>
            }}
            options={currencyOptions}
            setValue={this.setCurrency}
        />;

        return (
            <div className="header">
                <div className="container">
                    <div className="header--counter-weight">
                        {address ? <div role="button" className="header--mobile-menu--button">
                            <button onClick={this.props.actions.showMobileMenu}>
                                <FontAwesomeIcon icon={faBars} />
                            </button>
                        </div> : <></>}
                    </div>
                    <Link className="no-underline" to="/">
                        <div className="header--logo" />
                    </Link>
                    <div className="header--menu">
                        {languageDropdownNode}
                        {currencyDropdownNode}
                        <AccountDropdown />
                    </div>
                </div>
            </div>
        );
    }

    private readonly setCurrency = (currency: string): void => {
        this.props.actions.storeQuoteCurrency({ quoteCurrency: currency as Currency });
    }

    private readonly setLanguage = (language: string): void => {
        // NOT IMPLEMENTED
    }
}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        address: state.trader.address,
        quoteCurrency: state.statistics.quoteCurrency,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        storeQuoteCurrency,
        showMobileMenu,
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps>,
    RouteComponentProps {
}

export const Header = connect(mapStateToProps, mapDispatchToProps)(withRouter(HeaderClass));
