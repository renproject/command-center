import * as React from "react";

import { faAngleDown, faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Blocky } from "@renex/react-components";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import { bindActionCreators, Dispatch } from "redux";

import { storeQuoteCurrency } from "../store/actions/statistics/operatorActions";
import { login, logout } from "../store/actions/trader/accountActions";
import { showMobileMenu } from "../store/actions/ui/uiActions";
import { ApplicationData, currencies, Currency } from "../store/types";
import { CurrencyIcon } from "./CurrencyIcon";

import English from "../styles/images/rp-flag-uk.svg";

/**
 * Header is a visual component providing page branding and navigation.
 */
class HeaderClass extends React.Component<Props, State> {
    public constructor(props: Props, context: object) {
        super(props, context);
        this.state = {
            copied: false,
            accountDropdown: false,
            languageDropdown: false,
            currencyDropdown: false,
        };
    }

    public render = (): JSX.Element => {
        const { address, web3BrowserName, quoteCurrency } = this.props.store;
        const { accountDropdown, languageDropdown, currencyDropdown, copied } = this.state;

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
                    <ul className="header--menu">
                        <li
                            data-id="languageDropdown"
                            className="header--group header--group--language"
                            role="menuitem"
                            onClick={this.toggleDropdown}
                            onMouseEnter={this.showDropdown}
                            onMouseLeave={this.hideDropdown}
                        >
                            English <FontAwesomeIcon icon={faAngleDown} />
                            {languageDropdown ?
                                <ul className="header--dropdown header--dropdown--options">
                                    <li role="button" className="header--dropdown--selected">
                                        <img alt="" role="presentation" src={English} />
                                        {" "}
                                        English
                                            </li>
                                </ul> : null
                            }
                        </li>

                        <li
                            data-id="currencyDropdown"
                            className="header--group header--group--currency"
                            role="menuitem"
                            onClick={this.toggleDropdown}
                            onMouseEnter={this.showDropdown}
                            onMouseLeave={this.hideDropdown}
                        >
                            {quoteCurrency.toUpperCase()} <FontAwesomeIcon icon={faAngleDown} />
                            {currencyDropdown ?
                                <ul className="header--dropdown header--dropdown--currency">
                                    {currencies.map(({ currency, description }) => <li
                                        key={currency}
                                        role="button"
                                        data-id={currency}
                                        className={quoteCurrency === currency ?
                                            "header--dropdown--selected" :
                                            ""}
                                        onClick={this.setCurrency}
                                    >
                                        <CurrencyIcon currency={currency} />
                                        {" "}
                                        {description}
                                    </li>)}
                                </ul> : null
                            }
                        </li>
                        <li
                            data-id="accountDropdown"
                            className="header--group"
                            role="menuitem"
                            onClick={this.toggleDropdown}
                            onMouseEnter={this.showDropdown}
                            onMouseLeave={this.hideDropdown}
                        >
                            <div className="header--account">
                                {address && <Blocky address={address} />}
                                <div
                                    className={`header--account--right ${address ?
                                        "header--account--connected" :
                                        "header--account--disconnected"}`}
                                >
                                    <div className="header--account--type">
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
                                    {address ? <>
                                        <li role="button" onClick={this.copyToClipboard}>
                                            <span data-addr={address}>
                                                {copied ?
                                                    <span>Copied</span>
                                                    :
                                                    <span>Copy to clipboard</span>
                                                }
                                            </span>
                                        </li>
                                        <li
                                            role="button"
                                            onClick={this.handleLogout}
                                        >
                                            Log out
                                        </li>
                                    </> :
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

    private readonly handleLogin = async (): Promise<void> => {
        const { address, sdk } = this.props.store;
        if (sdk && !address) {
            await this.props.actions.login(sdk, { redirect: false, showPopup: true, immediatePopup: true });
        }
    }

    private readonly handleLogout = async (): Promise<void> => {
        const { sdk } = this.props.store;
        if (sdk) {
            await this.props.actions.logout(sdk, { reload: false });
        }
    }

    private readonly toggleDropdown = (e: React.MouseEvent<HTMLLIElement>): void => {
        const id = e.currentTarget.dataset ? e.currentTarget.dataset.id : undefined;
        if (id) {
            this.setState((state: State) => ({ ...state, [id]: !state[id], copied: false }));
        }
    }

    private readonly showDropdown = (e: React.MouseEvent<HTMLLIElement>): void => {
        const id = e.currentTarget.dataset ? e.currentTarget.dataset.id : undefined;
        if (id) {
            this.setState((state: State) => ({ ...state, [id]: true, copied: false }));
        }
    }

    private readonly hideDropdown = (e: React.MouseEvent<HTMLLIElement>): void => {
        const id = e.currentTarget.dataset ? e.currentTarget.dataset.id : undefined;
        if (id) {
            this.setState((state: State) => ({ ...state, [id]: false, copied: false }));
        }
    }

    private readonly setCurrency = (e: React.MouseEvent<HTMLLIElement>): void => {
        const id = e.currentTarget.dataset ? e.currentTarget.dataset.id : undefined;
        if (id) {
            this.props.actions.storeQuoteCurrency({ quoteCurrency: id as Currency });
        }
    }

    private readonly copyToClipboard = (e: React.MouseEvent<HTMLElement>): void => {
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
        web3: state.trader.web3,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        login,
        logout,
        storeQuoteCurrency,
        showMobileMenu,
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps>,
    RouteComponentProps {
}

interface State {
    accountDropdown: boolean;
    languageDropdown: boolean;
    currencyDropdown: boolean;
    copied: boolean;
}

export const Header = connect(mapStateToProps, mapDispatchToProps)(withRouter(HeaderClass));
