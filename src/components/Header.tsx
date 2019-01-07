import * as React from "react";

import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { connect } from "react-redux";
import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import { bindActionCreators, Dispatch } from "redux";

import { storeQuoteCurrency } from "../actions/statistics/operatorActions";
import { login } from "../actions/trader/accountActions";
import { Blocky } from "../components/Blocky";
import { ApplicationData, Currency } from "../reducers/types";
import { CurrencyIcon } from "./CurrencyIcon";

import English from "../styles/images/rp-flag-uk.svg";

interface HeaderProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps>,
    RouteComponentProps {
    hideOptions?: boolean;
}

interface HeaderState {
    accountDropdown: boolean;
    languageDropdown: boolean;
    currencyDropdown: boolean;
    copied: boolean;
}

/**
 * Header is a visual component providing page branding and navigation.
 */
class HeaderClass extends React.Component<HeaderProps, HeaderState> {
    public constructor(props: HeaderProps, context: object) {
        super(props, context);
        this.state = {
            copied: false,
            accountDropdown: false,
            languageDropdown: false,
            currencyDropdown: false,
        };
    }

    public render(): JSX.Element {
        const { hideOptions, store } = this.props;
        const { address, web3BrowserName, quoteCurrency } = store;
        const { accountDropdown, languageDropdown, currencyDropdown, copied } = this.state;
        const route = this.props.location.pathname;

        const loggedIn = (address != null);

        return (
            <div className="header">
                <div className="container">
                    <div className="header--counter-weight" />
                    <Link className="no-underline" to="/">
                        <div className="header--logo" />
                    </Link>
                    <ul className="header--menu">
                        {!hideOptions ?
                            <>
                                <li
                                    data-id="languageDropdown"
                                    className="header--group"
                                    onMouseEnter={this.showDropdown}
                                    onMouseLeave={this.hideDropdown}
                                >
                                    English <FontAwesomeIcon icon={faAngleDown} />
                                    {languageDropdown ?
                                        <ul className="header--dropdown header--dropdown--options">
                                            <li role="button" className="header--dropdown--selected">
                                                <img src={English} />
                                                {" "}
                                                English
                                            </li>
                                        </ul> : null
                                    }
                                </li>

                                <li
                                    data-id="currencyDropdown"
                                    className="header--group"
                                    onMouseEnter={this.showDropdown}
                                    onMouseLeave={this.hideDropdown}
                                >
                                    {quoteCurrency.toUpperCase()} <FontAwesomeIcon icon={faAngleDown} />
                                    {currencyDropdown ?
                                        <ul className="header--dropdown header--dropdown--currency">
                                            <li
                                                role="button"
                                                data-id={Currency.USD}
                                                className={quoteCurrency === Currency.USD ?
                                                    "header--dropdown--selected" :
                                                    ""}
                                                onClick={this.setCurrency}
                                            >
                                                <CurrencyIcon currency={Currency.USD} />
                                                {" "}
                                                USD Dollar (USD)
                                            </li>
                                            <li
                                                role="button"
                                                data-id={Currency.AUD}
                                                className={quoteCurrency === Currency.AUD ?
                                                    "header--dropdown--selected" :
                                                    ""}
                                                onClick={this.setCurrency}
                                            >
                                                <CurrencyIcon currency={Currency.AUD} />
                                                {" "}
                                                Australian Dollar (AUD)
                                            </li>
                                            <li
                                                role="button"
                                                data-id={Currency.BTC}
                                                className={quoteCurrency === Currency.BTC ?
                                                    "header--dropdown--selected" :
                                                    ""}
                                                onClick={this.setCurrency}
                                            >
                                                <CurrencyIcon currency={Currency.BTC} />
                                                {" "}
                                                Bitcoin (BTC)
                                            </li>
                                            <li
                                                role="button"
                                                data-id={Currency.ETH}
                                                className={quoteCurrency === Currency.ETH ?
                                                    "header--dropdown--selected" :
                                                    ""}
                                                onClick={this.setCurrency}
                                            >
                                                <CurrencyIcon currency={Currency.ETH} />
                                                {" "}
                                                Ethereum (ETH)
                                            </li>
                                        </ul> : null
                                    }
                                </li>
                            </>

                            : null}

                        <li
                            data-id="accountDropdown"
                            className="header--group"
                            onMouseEnter={this.showDropdown}
                            onMouseLeave={this.hideDropdown}
                        >
                            <div className="header--account">
                                {address && <Blocky address={address} />}
                                <div className="header--account--right">
                                    <div
                                        className={`header--account--type ${address ?
                                            "header--account--connected" :
                                            ""}`}
                                    >
                                        {web3BrowserName}
                                    </div>
                                    {address ?
                                        <div className="header--account--address">
                                            {address.substring(0, 8)}...{address.slice(-5)}
                                        </div> :
                                        <div className="header--account--address">Not connected</div>
                                    }
                                </div>
                            </div>
                            {accountDropdown ?
                                <ul className={`header--dropdown ${!address ? "header--dropdown--login" : ""}`}>
                                    {address ?
                                        <li role="button" onClick={this.copyToClipboard}>
                                            <span data-addr={address}>
                                                {copied ?
                                                    <span>Copied</span>
                                                    :
                                                    <span>Copy to clipboard</span>
                                                }
                                            </span>
                                        </li> :
                                        <li
                                            role="button"
                                            onClick={this.handleLogin}
                                            className="header--dropdown--highlight"
                                        >
                                            Connect {web3BrowserName}
                                        </li>
                                    }
                                </ul> : null
                            }
                        </li>
                    </ul>
                </div>
            </div>
        );
    }

    private handleLogin = async (): Promise<void> => {
        const { address, sdk } = this.props.store;
        if (!address) {
            await this.props.actions.login(sdk, { redirect: false, showPopup: true, immediatePopup: true });
        }
    }

    private showDropdown = (e: React.MouseEvent<HTMLLIElement>): void => {
        const id = e.currentTarget.dataset ? e.currentTarget.dataset.id : undefined;
        if (id) {
            this.setState((state) => ({ ...state, [id]: true, copied: false }));
        }
    }

    private hideDropdown = (e: React.MouseEvent<HTMLLIElement>): void => {
        const id = e.currentTarget.dataset ? e.currentTarget.dataset.id : undefined;
        if (id) {
            this.setState((state) => ({ ...state, [id]: false, copied: false }));
        }
    }

    private setCurrency = (e: React.MouseEvent<HTMLLIElement>): void => {
        const id = e.currentTarget.dataset ? e.currentTarget.dataset.id : undefined;
        if (id) {
            this.props.actions.storeQuoteCurrency({ quoteCurrency: id as Currency });
        }
    }

    private copyToClipboard = (e: React.MouseEvent<HTMLElement>): void => {
        const el = e.currentTarget.childNodes[0] as Element;
        const address = el.getAttribute("data-addr");
        if (address) {
            const dummy = document.createElement("input");
            document.body.appendChild(dummy);
            dummy.setAttribute("value", address);
            dummy.select();
            document.execCommand("copy");
            document.body.removeChild(dummy);
        }
        this.setState({ copied: true });
    }
}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        address: state.trader.address,
        web3BrowserName: state.trader.web3BrowserName,
        quoteCurrency: state.statistics.quoteCurrency,
        sdk: state.trader.sdk,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        login,
        storeQuoteCurrency,
    }, dispatch),
});

export const Header = connect(mapStateToProps, mapDispatchToProps)(withRouter(HeaderClass));
