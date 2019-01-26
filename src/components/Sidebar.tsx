import * as React from "react";

import { faStar } from "@fortawesome/free-regular-svg-icons";
import { faFire, faThLarge, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { Link } from "react-router-dom";
import { bindActionCreators, Dispatch } from "redux";

import { RegistrationStatus } from "../actions/statistics/operatorActions";
import { hideMobileMenu } from "../actions/ui/uiActions";
import { Token } from "../lib/ethereum/tokens";
import { ApplicationData, Currency } from "../reducers/types";
import { Blocky } from "./Blocky";
import { CurrencyIcon } from "./CurrencyIcon";
import { DarknodeID } from "./DarknodeID";
import { darknodeIDHexToBase58 } from "./pages/Darknode";
import { TokenBalance } from "./TokenBalance";

/**
 * Sidebar displays stats about an operator's darknodes collectively,
 * as well as a breakdown of each darknode
 */
class SidebarClass extends React.Component<Props> {
    public constructor(props: Props, context: object) {
        super(props, context);
    }

    public render = (): JSX.Element => {
        const { selectedDarknode, store } = this.props;
        const { darknodeList, darknodeDetails, darknodeNames, quoteCurrency, mobileMenuActive } = store;

        console.log(`mobileMenuActive: ${mobileMenuActive}`);
        return (
            <nav className={`sidebar ${mobileMenuActive ? "sidebar--mobile--active" : ""}`}>
                <ul>
                    <div className="sidebar--nav">
                        {/* <Link className="no-underline" to="/">
                            <li>
                                <div className="sidebar--nav--icon sidebar--icon">
                                    <FontAwesomeIcon icon={faCircle} className="darknode-card--bottom--icon" />
                                </div>
                                <div className="sidebar--text">Home</div>
                            </li>
                        </Link> */}

                        <li className="mobile-only" role="menuitem" onClick={this.hideMobileMenu}>
                            <div className="sidebar--nav--icon sidebar--icon">
                                <FontAwesomeIcon icon={faTimes} className="darknode-card--bottom--icon" />
                            </div>
                            <div className="sidebar--text">Close</div>
                        </li>

                        <Link className="no-underline" to="/" onClick={this.hideMobileMenu}>
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
                        return <Link className="no-underline" key={darknodeID} to={`/darknode/${darknodeIDBase58}`} onClick={this.hideMobileMenu}>
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

    private readonly hideMobileMenu = (): void => {
        this.props.actions.hideMobileMenu();
    }
}

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

export const Sidebar = connect(mapStateToProps, mapDispatchToProps)(SidebarClass);
