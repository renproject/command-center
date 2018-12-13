import * as React from "react";

import { connect } from "react-redux";
import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import { bindActionCreators, Dispatch } from "redux";

import { login } from "@Actions/trader/accountActions";
import { Blocky } from "@Components/Blocky";
import { ApplicationData } from "@Reducers/types";

interface HeaderProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps>,
    RouteComponentProps {
}

interface HeaderState {
    accountDropdownVisible: boolean;
    languageDropdownVisible: boolean;
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
        };
    }

    public render(): JSX.Element {
        const { address, web3BrowserName } = this.props.store;
        const { accountDropdownVisible, languageDropdownVisible, copied } = this.state;
        const route = this.props.location.pathname;

        const loggedIn = (address != null);

        return (
            <div className="header">
                <div className="container">
                    <div className="header--counter-weight" />
                    <Link to={loggedIn ? "/home" : "/"}>
                        <div className="header--logo" />
                    </Link>
                    <ul className="header--menu">
                        <li
                            className="header--group"
                            onMouseEnter={this.showLanguageDropDown}
                            onMouseLeave={this.hideLanguageDropdown}
                        >
                            English ﹀
                                {languageDropdownVisible ?
                                <ul className="header--dropdown">
                                    <li role="button">English</li>
                                    <li role="button">Chinese</li>
                                </ul> : null
                            }
                        </li>

                        <li><Link to="/home"><span>USD ﹀</span></Link></li>


                        <li
                            className="header--group"
                            onMouseEnter={this.showAccountDropDown}
                            onMouseLeave={this.hideAccountDropdown}
                        >
                            <div className="header--account" onClick={this.handleLogin}>
                                <div className="header--blocky">
                                    {address && <Blocky address={address} />}
                                </div>
                                <div className="header--account--right">
                                    <div className={`header--account--type ${address ? "header--account--connected" : ""}`}>{web3BrowserName}</div>
                                    {address ?
                                        <div className="header--account--address">{address.substring(0, 8)}...{address.slice(-5)}</div> :
                                        <div className="header--account--address">Not connected</div>
                                    }
                                </div>
                            </div>
                            {address && accountDropdownVisible ?
                                <ul className="header--dropdown">
                                    <li role="button" onClick={this.copyToClipboard}>
                                        <span data-addr={address}>
                                            {copied ?
                                                <span>Copied</span>
                                                :
                                                <span>Copy to clipboard</span>
                                            }
                                        </span>
                                    </li>
                                </ul> : null
                            }
                        </li>
                    </ul>
                </div>
            </div>
        );
    }

    private handleLogin = async (): Promise<void> => {
        const { address } = this.props.store;
        if (!address) {
            await this.props.actions.login({ redirect: false });
        }
    }

    private showAccountDropDown = (): void => {
        this.setState({ accountDropdownVisible: true, copied: false });
    }

    private hideAccountDropdown = (): void => {
        this.setState({ accountDropdownVisible: false, copied: false });
    }

    private showLanguageDropDown = (): void => {
        this.setState({ languageDropdownVisible: true, copied: false });
    }

    private hideLanguageDropdown = (): void => {
        this.setState({ languageDropdownVisible: false, copied: false });
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
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        login,
    }, dispatch),
});

export const Header = connect(mapStateToProps, mapDispatchToProps)(withRouter(HeaderClass));
