import * as React from "react";

import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { RenNetwork, RenNetworks } from "@renproject/contracts";
import { currencies, Currency, CurrencyIcon, Dropdown } from "@renproject/react-components";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import { bindActionCreators } from "redux";

import { storeRenNetwork } from "../../store/account/accountActions";
import { ApplicationState } from "../../store/applicationState";
import { storeQuoteCurrency } from "../../store/network/operatorActions";
import { AppDispatch } from "../../store/rootReducer";
import { showMobileMenu } from "../../store/ui/uiActions";
import { ReactComponent as RenVMIcon } from "../../styles/images/Icon-HyperDrive.svg";
import { ReactComponent as OverviewIcon } from "../../styles/images/Icon-Overview.svg";
// import { ReactComponent as English } from "../../styles/images/rp-flag-uk.svg";
import { AccountDropdown } from "./AccountDropdown";
import { Search } from "./Search";

// const languageOptions = new Map()
//     .set("EN",
//         <><English /> English</>
//     );

const networkOptions = new Map()
    // .set(RenNetwork.Mainnet, <>Mainnet</>)
    .set(RenNetwork.Chaosnet, <>Chaosnet</>)
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
const HeaderClass = (props: Props) => {

    const setCurrency = (currency: string): void => {
        props.actions.storeQuoteCurrency({ quoteCurrency: currency as Currency });
    };

    const setNetwork = (network: string): void => {
        props.actions.storeRenNetwork(RenNetworks[network]);
        setInterval(() => {
            const currentLocation = window.location.pathname;
            // history.push("/loading");
            // Reload to clear all stores and cancel timeouts
            // (e.g. deposit/withdrawal confirmations)
            // tslint:disable-next-line: no-console
            window.location.reload();
        }, 100);
    };

    // const setLanguage = (language: string): void => {
    //     // NOT IMPLEMENTED
    // }

    const { location } = props;
    const { address, quoteCurrency, renNetwork } = props.store;

    // const languageDropdownNode = <Dropdown
    //     key="languageDropdown"
    //     selected={{
    //         value: "EN",
    //         render: "English",
    //     }}
    //     options={languageOptions}
    //     setValue={setLanguage}
    // />;

    const networkDropdownNode = <Dropdown
        key="networkDropdown"
        selected={{
            value: renNetwork.name,
            render: networkOptions.get(renNetwork.name),
        }}
        options={networkOptions}
        setValue={setNetwork}
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
        setValue={setCurrency}
    />;

    return (
        <div className={["header"].join(" ")}>
            {address ? <div role="button" className="header--mobile-menu--button">
                <button onClick={props.actions.showMobileMenu}>
                    <FontAwesomeIcon icon={faBars} />
                </button>
            </div> : <></>}
            <Link className="no-underline" to="/">
                <div className="header--logo" />
            </Link>
            <Search />
            <div className="header--menu">
                <Link className="no-underline" to="/">
                    <li className={["header--group", location.pathname === "/" ? "header--group--active" : ""].join(" ")}>
                        <div className="header--selected">
                            <OverviewIcon className="header--selected--icon" /> <div>Network Stats</div>
                        </div>
                    </li>
                </Link>
                <Link className="no-underline" to="/darknode-stats">
                    <li className={["header--group", location.pathname === "/darknode-stats" ? "header--group--active" : ""].join(" ")}>
                        <div className="header--selected">
                            <OverviewIcon className="header--selected--icon" /> <div>Darknodes</div>
                        </div>
                    </li>
                </Link>
                <Link className="no-underline" to="/renvm">
                    <li className={["header--group", location.pathname.match("/(renvm|hyperdrive)") ? "header--group--active" : ""].join(" ")}>
                        <div className="header--selected">
                            <RenVMIcon className="header--selected--icon" /> <div>RenVM</div>
                        </div>
                    </li>
                </Link>
                {/* {languageDropdownNode} */}
                {currencyDropdownNode}
                {networkDropdownNode}
                <AccountDropdown />
            </div>
        </div>
    );
};

const mapStateToProps = (state: ApplicationState) => ({
    store: {
        address: state.account.address,
        quoteCurrency: state.network.quoteCurrency,
        renNetwork: state.account.renNetwork,
    },
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
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
