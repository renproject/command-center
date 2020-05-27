import * as React from "react";

import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { RenNetwork, RenNetworks } from "@renproject/contracts";
import { currencies, Currency, CurrencyIcon, Dropdown } from "@renproject/react-components";
import { Link, RouteComponentProps, withRouter } from "react-router-dom";

import { NetworkStateContainer } from "../../store/networkStateContainer";
import { UIContainer } from "../../store/uiStore";
import { Web3Container } from "../../store/web3Store";
// import { Web3Container } from "../../store/web3Store";
import { ReactComponent as RenVMIcon } from "../../styles/images/Icon-HyperDrive.svg";
import { ReactComponent as IntegratorsIcon } from "../../styles/images/icon-integrators.svg";
import { ReactComponent as NetworkIcon } from "../../styles/images/icon-network.svg";
import { ReactComponent as OverviewIcon } from "../../styles/images/Icon-Overview.svg";
// import { ReactComponent as English } from "../../styles/images/rp-flag-uk.svg";
import { AccountDropdown } from "./AccountDropdown";
import { ExternalLink, URLs } from "./ExternalLink";
import { MoreDropdown } from "./MoreDropdown";
import { StatusDot, StatusDotColor } from "./StatusDot";

// import { Search } from "./Search";

// const languageOptions = new Map()
//     .set("EN",
//         <><English /> English</>
//     );

// const networkOptions = new Map()
//     // .set(RenNetwork.Mainnet, <>Mainnet</>)
//     .set(RenNetwork.Chaosnet, <>Chaosnet</>)
//     .set(RenNetwork.Testnet, <>Testnet</>)
//     .set(RenNetwork.Devnet, <>Devnet</>)
//     .set(RenNetwork.Localnet, <>Localnet</>)
//     ;

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

const MenuItem: React.FC<{ path: string, title: string, icon: JSX.Element, activePath: string }> = ({ path, title, icon, activePath }) =>
    <Link className="no-underline" to={path}>
        <li className={["header--group", activePath.split("/")[1] === path.split("/")[1] ? "header--group--active" : ""].join(" ")}>
            <div className="header--selected">
                {icon} <div>{title}</div>
            </div>
        </li>
    </Link>;

interface Props extends RouteComponentProps {
}

/**
 * Header is a visual component providing page branding and navigation.
 */
export const Header = withRouter(({ location }: Props) => {

    const { showMobileMenu } = UIContainer.useContainer();
    const { renNetwork } = Web3Container.useContainer();
    const { quoteCurrency, setQuoteCurrency } = NetworkStateContainer.useContainer();

    const setCurrency = (currency: string): void => {
        setQuoteCurrency(currency as Currency);
    };

    // const setNetwork = (network: string): void => {
    //     setRenNetwork(RenNetworks[network]);
    //     setInterval(() => {
    //         window.location.reload();
    //     }, 100);
    // };

    // const setLanguage = (language: string): void => {
    //     // NOT IMPLEMENTED
    // }

    // const languageDropdownNode = <Dropdown
    //     key="languageDropdown"
    //     selected={{
    //         value: "EN",
    //         render: "English",
    //     }}
    //     options={languageOptions}
    //     setValue={setLanguage}
    // />;

    // const networkDropdownNode = <Dropdown
    //     key="networkDropdown"
    //     selected={{
    //         value: renNetwork.name,
    //         render: networkOptions.get(renNetwork.name),
    //     }}
    //     options={networkOptions}
    //     setValue={setNetwork}
    // />;

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
            <Link className="no-underline" to="/">
                <div className="header--logo" />
            </Link>
            {renNetwork.name === "mainnet" ? <ExternalLink href={URLs.welcomeToCommandCenter} className="new">
                <span className="new-new xl-or-larger">New</span>
                <span className="new-blue">Mainnet is live. →</span>
            </ExternalLink> : <div className="new">
                    <div className="header--network"><StatusDot color={StatusDotColor.Yellow} size={16} /> <span className="header--network--text">{renNetwork.name.toUpperCase()}</span></div>
                </div>}
            <div className="header--menu">
                <MenuItem path="/" title="Network" icon={<NetworkIcon />} activePath={location.pathname} />
                <MenuItem path="/integrators" title="Integrators" icon={<IntegratorsIcon />} activePath={location.pathname} />
                <MenuItem path="/darknode-stats" title="Darknodes" icon={<OverviewIcon />} activePath={location.pathname} />
                <MenuItem path="/renvm" title="RenVM" icon={<RenVMIcon />} activePath={location.pathname} />

                {/* {languageDropdownNode} */}
                {currencyDropdownNode}
                {/* {networkDropdownNode} */}
                <MoreDropdown />
                <AccountDropdown />
            </div>
            <div role="button" className="header--mobile-menu--button">
                <button onClick={showMobileMenu}>
                    <FontAwesomeIcon icon={faBars} />
                </button>
            </div>
        </div>
    );
});
