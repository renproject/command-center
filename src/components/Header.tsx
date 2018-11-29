import * as React from "react";

import { History, Location } from "history";
import { connect } from "react-redux";
import { Link, match, withRouter } from "react-router-dom";
import { bindActionCreators, Dispatch } from "redux";

import RenExSDK from "renex-sdk-ts";

import { logout, LogoutAction } from "@Actions/trader/accountActions";
import { ApplicationData } from "@Reducers/types";

import Blocky from "@Components/Blocky";

interface StoreProps {
    address: string | null;
    sdk: RenExSDK;
}

interface HeaderProps extends StoreProps {
    withMenu: boolean;

    // withRouter props
    history: History;
    location: Location;
    match: match;
    staticContext: undefined;

    actions: {
        logout: LogoutAction;
    };
}

interface HeaderState {
    accountDropdownVisible: boolean;
    languageDropdownVisible: boolean;
    copied: boolean;
}

/**
 * Header is a visual component providing page branding and navigation.
 */
class Header extends React.Component<HeaderProps, HeaderState> {
    public constructor(props: HeaderProps, context: object) {
        super(props, context);
        this.state = {
            copied: false,
            accountDropdownVisible: false,
            languageDropdownVisible: false,
        };
    }

    public render(): JSX.Element {
        const { address, withMenu } = this.props;
        const { accountDropdownVisible, languageDropdownVisible, copied } = this.state;
        const route = this.props.location.pathname;

        const loggedIn = (address != null);

        return (
            <div className="header">
                <div className="container">
                    <Link to={loggedIn ? "/home" : "/"}>
                        <div className="header--logo" />
                    </Link>
                    {withMenu ?
                        <ul className="header--menu">
                            {address &&
                                <li
                                    className="header--group"
                                    onMouseEnter={this.showAccountDropDown}
                                    onMouseLeave={this.hideAccountDropdown}
                                >
                                    <div className="header--account">
                                        <Blocky address={address} />
                                        <div className="header--account--right">
                                            <div className="header--account--type">MetaMask</div>
                                            <div className="header--account--address">{address.substring(0, 8)}...{address.slice(-5)}</div>
                                        </div>
                                    </div>
                                    {accountDropdownVisible ?
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
                                            <li role="button" onClick={this.handleLogOut}>Logout</li>
                                        </ul> : null
                                    }
                                </li>
                            }

                            <li><Link to="/home"><span>User Manual</span></Link></li>

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
                        </ul> : null
                    }
                </div>
            </div>
        );
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

    private handleLogOut = (): void => {
        const { sdk } = this.props;
        this.props.actions.logout(sdk, { reload: true });
    }
}

function mapStateToProps(state: ApplicationData): StoreProps {
    return {
        address: state.trader.address,
        sdk: state.trader.sdk,
    };
}

function mapDispatchToProps(dispatch: Dispatch): { actions: HeaderProps["actions"] } {
    return {
        actions: bindActionCreators({
            logout,
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Header));
