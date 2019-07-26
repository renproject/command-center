import * as React from "react";

import { faStar } from "@fortawesome/free-regular-svg-icons";
import { faFire, faGlobeAmericas, faThLarge, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Blocky, CurrencyIcon } from "@renproject/react-components";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { Link } from "react-router-dom";
import { bindActionCreators, Dispatch } from "redux";

import { Token } from "../lib/ethereum/tokens";
import { RegistrationStatus } from "../store/actions/statistics/operatorActions";
import { hideMobileMenu } from "../store/actions/ui/uiActions";
import { ApplicationData, Currency } from "../store/types";
import { DarknodeID } from "./DarknodeID";
import { darknodeIDHexToBase58 } from "./pages/Darknode";
import { TokenBalance } from "./TokenBalance";

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        darknodeList: state.trader.address ? state.statistics.darknodeList.get(state.trader.address) : null,
        darknodeDetails: state.statistics.darknodeDetails,
        darknodeNames: state.statistics.darknodeNames,
        quoteCurrency: state.statistics.quoteCurrency,
        mobileMenuActive: state.ui.mobileMenuActive,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        hideMobileMenu,
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
    selectedDarknode: string | undefined;
}
/**
 * Sidebar displays stats about an operator's darknodes collectively,
 * as well as a breakdown of each darknode
 */
export const Sidebar = connect(mapStateToProps, mapDispatchToProps)(
    ({ selectedDarknode, store, actions }: Props) => {
        const { darknodeList, darknodeDetails, darknodeNames, quoteCurrency, mobileMenuActive } = store;

        return (
            <nav className={`sidebar ${mobileMenuActive ? "sidebar--mobile--active" : ""}`}>
                <ul>
                    <div className="sidebar--nav">
                        <Link className="no-underline" to="/">
                            <li>
                                <div className="sidebar--nav--icon sidebar--icon">
                                    <FontAwesomeIcon icon={faGlobeAmericas} className="darknode-card--bottom--icon" />
                                </div>
                                <div className="sidebar--text">Overview</div>
                            </li>
                        </Link>

                        <li className="mobile-only" role="menuitem" onClick={actions.hideMobileMenu}>
                            <div className="sidebar--nav--icon sidebar--icon">
                                <FontAwesomeIcon icon={faTimes} className="darknode-card--bottom--icon" />
                            </div>
                            <div className="sidebar--text">Close</div>
                        </li>

                        <Link className="no-underline" to="/all" onClick={actions.hideMobileMenu}>
                            <li>
                                <div className="sidebar--nav--icon sidebar--icon">
                                    <FontAwesomeIcon icon={faThLarge} className="darknode-card--bottom--icon" />
                                </div>
                                <div className="sidebar--text">All Darknodes</div>
                            </li>
                        </Link>
                    </div>

                    {darknodeList && darknodeList.map((darknodeID: string) => {
                        const details = darknodeDetails.get(darknodeID);
                        const storedName = darknodeNames.get(darknodeID);
                        const name = storedName ? storedName : <DarknodeID darknodeID={darknodeID} />;

                        const active = darknodeID === selectedDarknode;
                        const faded = details && details.registrationStatus === RegistrationStatus.Unregistered;

                        const darknodeIDBase58 = darknodeIDHexToBase58(darknodeID);

                        // tslint:disable-next-line:jsx-no-lambda FIXME
                        return <Link className="no-underline" key={darknodeID} to={`/darknode/${darknodeIDBase58}`} onClick={actions.hideMobileMenu}>
                            <li className={`${active ? "sidebar--active" : ""} ${faded ? "sidebar--faded" : ""}`}>
                                <div className="sidebar--icon">
                                    <Blocky address={darknodeID} fgColor="#006FE8" bgColor="transparent" />
                                </div>
                                <div className="sidebar--text">
                                    <div className="sidebar--name">{name}</div>
                                    <div className="sidebar--text--details">
                                        <div className="sidebar--text--rewards">
                                            {details ? <>
                                                <FontAwesomeIcon icon={faStar} className="sidebar--text--icon" />
                                                <span className="currency-value">
                                                    <CurrencyIcon currency={quoteCurrency} />
                                                    <TokenBalance
                                                        token={Token.ETH}
                                                        convertTo={quoteCurrency}
                                                        amount={details.feesEarnedTotalEth}
                                                    />
                                                </span>
                                                {" "}
                                                <span className="currency-symbol">
                                                    {quoteCurrency.toUpperCase()}
                                                </span>
                                            </> : null}
                                        </div>
                                        <div className="sidebar--text--gas">
                                            {details ? <>
                                                <FontAwesomeIcon icon={faFire} className="sidebar--text--icon" />
                                                <span className="currency-value">
                                                    <CurrencyIcon currency={Currency.ETH} />
                                                    <TokenBalance
                                                        token={Token.ETH}
                                                        amount={details.ethBalance}
                                                        digits={3}
                                                    />
                                                </span>{" "}<span className="currency-symbol">ETH</span>
                                            </> : null
                                            }
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </Link>;
                    }).toArray()}
                </ul>
            </nav>
        );
    }
);
