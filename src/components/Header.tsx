import * as React from "react";

import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CurrencyIcon, Dropdown } from "@renproject/react-components";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import { bindActionCreators, Dispatch } from "redux";

import { storeQuoteCurrency } from "../store/actions/statistics/operatorActions";
import { storeRenNetwork } from "../store/actions/trader/accountActions";
import { showMobileMenu } from "../store/actions/ui/uiActions";
import { ApplicationData, currencies, Currency, RenNetwork } from "../store/types";
import { ReactComponent as English } from "../styles/images/rp-flag-uk.svg";
import { AccountDropdown } from "./AccountDropdown";

const languageOptions = new Map()
    .set("EN",
        <><English /> English</>
    );

const networkOptions = new Map()
    .set(RenNetwork.Mainnet, <>Mainnet</>)
    .set(RenNetwork.Testnet, <>Testnet</>)
    .set(RenNetwork.Devnet, <>Devnet</>)
    .set(RenNetwork.Localnet, <>Localnet</>)
    ;

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
        const { address, quoteCurrency, renNetwork } = this.props.store;

        const languageDropdownNode = <Dropdown
            key="languageDropdown"
            selected={{
                value: "EN",
                render: "English",
            }}
            options={languageOptions}
            setValue={this.setLanguage}
        />;

        const networkDropdownNode = <Dropdown
            key="networkDropdown"
            selected={{
                value: renNetwork,
                render: networkOptions.get(renNetwork),
            }}
            options={networkOptions}
            setValue={this.setNetwork}
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
                        {networkDropdownNode}
                        <AccountDropdown />
                    </div>
                </div>
            </div>
        );
    }

    private readonly setCurrency = (currency: string): void => {
        this.props.actions.storeQuoteCurrency({ quoteCurrency: currency as Currency });
    }

    private readonly setNetwork = (network: string): void => {
        this.props.actions.storeRenNetwork(network as RenNetwork);
        setInterval(() => {
            const currentLocation = window.location.pathname;
            // history.push("/loading");
            // Reload to clear all stores and cancel timeouts
            // (e.g. deposit/withdrawal confirmations)
            window.location.replace(currentLocation);
        }, 100);
    }

    private readonly setLanguage = (language: string): void => {
        // NOT IMPLEMENTED
    }
}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        address: state.trader.address,
        quoteCurrency: state.statistics.quoteCurrency,
        renNetwork: state.trader.renNetwork,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        storeQuoteCurrency,
        showMobileMenu,
        storeRenNetwork,
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps>,
    RouteComponentProps {
}

export const Header = connect(mapStateToProps, mapDispatchToProps)(withRouter(HeaderClass));
