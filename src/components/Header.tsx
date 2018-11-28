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
    dropdownVisible: boolean;
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
            dropdownVisible: false,
        };
        this.showDropdown = this.showDropdown.bind(this);
        this.hideDropdown = this.hideDropdown.bind(this);
        this.copyToClipboard = this.copyToClipboard.bind(this);
        this.handleLogOut = this.handleLogOut.bind(this);
    }

    public render(): JSX.Element {
        const { address, withMenu } = this.props;
        const { dropdownVisible, copied } = this.state;
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
                            <li className={route === "/home" ? "active" : ""}><Link to="/home"><span>Home</span></Link></li>
                            <li className="header--logout" onClick={this.handleLogOut}><Link to=""><span>Logout</span></Link></li>
                            {address &&
                                <li
                                    className="header--account"
                                    onMouseEnter={this.showDropdown}
                                    onMouseLeave={this.hideDropdown}
                                >
                                    <Blocky address={address} />
                                    {dropdownVisible ?
                                        <ul className="header--dropdown">
                                            <li role="button" onClick={this.copyToClipboard}>
                                                <span data-addr={address}>
                                                    {copied ?
                                                        <span>Copied</span>
                                                        :
                                                        <span>{address.substring(0, 8)}...{address.slice(-5)}</span>
                                                    }
                                                </span>
                                            </li>
                                            <li role="button" onClick={this.handleLogOut}>Logout</li>
                                        </ul> : null
                                    }
                                </li>
                            }
                        </ul> : null
                    }
                </div>
            </div>
        );
    }

    private showDropdown(): void {
        this.setState({ dropdownVisible: true, copied: false });
    }

    private hideDropdown(): void {
        this.setState({ dropdownVisible: false, copied: false });
    }

    private copyToClipboard(e: React.MouseEvent<HTMLElement>): void {
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

    private handleLogOut(): void {
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
