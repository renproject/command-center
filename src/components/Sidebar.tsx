import * as React from "react";

import { faCircle, faFire, faThLarge } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Dispatch } from "redux";
import { bindActionCreators } from "redux";

import { faEthereum } from "@fortawesome/free-brands-svg-icons";
import { faStar } from "@fortawesome/free-regular-svg-icons";
import { ApplicationData } from "@Reducers/types";
import { Blocky } from "./Blocky";
import { Token } from "./statuspage/lib/tokens";
import { TokenBalance } from "./statuspage/TokenBalance";

interface SidebarProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
    selectedDarknode: string | null;
}

/**
 * Sidebar displays stats about an operator's darknodes collectively,
 * as well as a breakdown of each darknode
 */
class SidebarClass extends React.Component<SidebarProps> {
    public constructor(props: SidebarProps, context: object) {
        super(props, context);
    }

    public render(): JSX.Element {
        const { selectedDarknode, store } = this.props;
        const { darknodeList, darknodeDetails, quoteCurrency } = store;

        return (
            <nav className="sidebar">
                <ul>
                    <div className="sidebar--nav">
                        <Link to="/"><li>
                            <div className="sidebar--nav--icon sidebar--icon"><FontAwesomeIcon icon={faCircle} className="darknode-card--bottom--icon" /></div>
                            <div className="sidebar--text">Home</div>
                        </li></Link>

                        <Link to="/"><li>
                            <div className="sidebar--nav--icon sidebar--icon"><FontAwesomeIcon icon={faThLarge} className="darknode-card--bottom--icon" /></div>
                            <div className="sidebar--text">All Darknodes</div>
                        </li></Link>
                    </div>

                    {darknodeList && darknodeList.map((darknodeID) => {
                        const details = darknodeDetails.get(darknodeID);
                        // tslint:disable-next-line:jsx-no-lambda FIXME
                        return <Link key={darknodeID} to={`/darknode/${darknodeID}`}>
                            <li className={darknodeID === selectedDarknode ? "sidebar--active" : ""}>
                                <div className="sidebar--icon">
                                    <Blocky address={darknodeID} fgColor="#006FE8" bgColor="transparent" />
                                </div>
                                <div className="sidebar--text">
                                    <div>
                                        {details ? details.name : `${darknodeID.substring(0, 8)}...${darknodeID.slice(-5)}`}
                                    </div>
                                    <div className="sidebar--text--details">
                                        <div className="sidebar--text--rewards">
                                            {details ? <>
                                                <FontAwesomeIcon icon={faStar} className="sidebar--text--icon" />
                                                <span className="currency-value">$<TokenBalance token={Token.ETH} convertTo={quoteCurrency} amount={details.feesEarnedTotalEth} /></span> <span className="currency-symbol">{quoteCurrency.toUpperCase()}</span>
                                            </> : null}
                                        </div>
                                        <div className="sidebar--text--gas">
                                            {details ? <>
                                                <FontAwesomeIcon icon={faFire} className="sidebar--text--icon" />
                                                <span className="currency-value"><FontAwesomeIcon icon={faEthereum} /><TokenBalance token={Token.ETH} amount={details.ethBalance} digits={3} /></span> <span className="currency-symbol">ETH</span>
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
}


const mapStateToProps = (state: ApplicationData) => ({
    store: {
        darknodeList: state.statistics.darknodeList,
        darknodeDetails: state.statistics.darknodeDetails,
        quoteCurrency: state.statistics.quoteCurrency,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
    }, dispatch),
});

export const Sidebar = connect(mapStateToProps, mapDispatchToProps)(SidebarClass);