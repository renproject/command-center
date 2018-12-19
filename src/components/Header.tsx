import * as React from "react";

import { faBitcoin, faEthereum } from "@fortawesome/free-brands-svg-icons";
import { faDollarSign } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { connect } from "react-redux";
import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import { bindActionCreators, Dispatch } from "redux";

import { storeQuoteCurrency } from "@Actions/statistics/operatorActions";
import { login } from "@Actions/trader/accountActions";
import { Blocky } from "@Components/Blocky";
import { ApplicationData, Currency } from "@Reducers/types";

interface HeaderProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps>,
    RouteComponentProps {
    hideOptions?: boolean;
}

interface HeaderState {
    accountDropdownVisible: boolean;
    languageDropdownVisible: boolean;
    currencyDropdownVisible: boolean;
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
            accountDropdownVisible: false,
            languageDropdownVisible: false,
            currencyDropdownVisible: false,
        };
    }

    public render(): JSX.Element {
        const { hideOptions, store } = this.props;
        const { address, web3BrowserName, quoteCurrency } = store;
        const { accountDropdownVisible, languageDropdownVisible, currencyDropdownVisible, copied } = this.state;
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
                                    className="header--group"
                                    onMouseEnter={this.showLanguageDropDown}
                                    onMouseLeave={this.hideLanguageDropdown}
                                >
                                    English ﹀
                                {languageDropdownVisible ?
                                        <ul className="header--dropdown">
                                            <li role="button">English</li>
                                        </ul> : null
                                    }
                                </li>


                                <li
                                    className="header--group"
                                    onMouseEnter={this.showCurrencyDropDown}
                                    onMouseLeave={this.hideCurrencyDropdown}
                                >
                                    {quoteCurrency.toUpperCase()} ﹀
                                {currencyDropdownVisible ?
                                        <ul className="header--dropdown header--dropdown--currency">
                                            <li role="button" onClick={this.setCurrencyToUSD}><FontAwesomeIcon icon={faDollarSign} /> USD Dollar (USD)</li>
                                            <li role="button" onClick={this.setCurrencyToAUD}><FontAwesomeIcon icon={faDollarSign} /> Australian DOllar (AUD)</li>
                                            <li role="button" onClick={this.setCurrencyToBTC}><FontAwesomeIcon icon={faBitcoin} /> Bitcoin (BTC)</li>
                                            <li role="button" onClick={this.setCurrencyToETH}><FontAwesomeIcon icon={faEthereum} /> Ethereum (ETH)</li>
                                        </ul> : null
                                    }
                                </li>
                            </>

                            : null}

                        <li
                            className="header--group"
                            onMouseEnter={this.showAccountDropDown}
                            onMouseLeave={this.hideAccountDropdown}
                        >
                            <div className="header--account">
                                {address && <Blocky address={address} />}
                                <div className="header--account--right">
                                    <div className={`header--account--type ${address ? "header--account--connected" : ""}`}>{web3BrowserName}</div>
                                    {address ?
                                        <div className="header--account--address">{address.substring(0, 8)}...{address.slice(-5)}</div> :
                                        <div className="header--account--address">Not connected</div>
                                    }
                                </div>
                            </div>
                            {accountDropdownVisible ?
                                <ul className="header--dropdown">
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
                                        <li role="button" onClick={this.handleLogin} className="header--dropdown--highlight">
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

    private showAccountDropDown = (): void => {
        this.setState({ accountDropdownVisible: true, copied: false });
    }

    private hideAccountDropdown = (): void => {
        this.setState({ accountDropdownVisible: false, copied: false });
    }

    private showLanguageDropDown = (): void => {
        this.setState({ languageDropdownVisible: true });
    }

    private hideLanguageDropdown = (): void => {
        this.setState({ languageDropdownVisible: false });
    }

    private showCurrencyDropDown = (): void => {
        this.setState({ currencyDropdownVisible: true });
    }

    private hideCurrencyDropdown = (): void => {
        this.setState({ currencyDropdownVisible: false });
    }

    // TODO: Get value dynamically
    private setCurrencyToUSD = (): void => {
        this.props.actions.storeQuoteCurrency({ quoteCurrency: Currency.USD });
    }
    private setCurrencyToAUD = (): void => {
        this.props.actions.storeQuoteCurrency({ quoteCurrency: Currency.AUD });
    }
    private setCurrencyToBTC = (): void => {
        this.props.actions.storeQuoteCurrency({ quoteCurrency: Currency.BTC });
    }
    private setCurrencyToETH = (): void => {
        this.props.actions.storeQuoteCurrency({ quoteCurrency: Currency.ETH });
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
