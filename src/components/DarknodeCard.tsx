import * as React from "react";

import { Map } from "immutable";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { bindActionCreators, Dispatch } from "redux";

import { RegistrationStatus } from "@Actions/statistics/operatorActions";
import { Blocky } from "@Components/Blocky";
import { faStar } from "@fortawesome/free-regular-svg-icons";
import { faFire } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Token } from "@Library/tokens";
import { ApplicationData, Currency, DarknodeDetails } from "@Reducers/types";
import { CurrencyIcon } from "./CurrencyIcon";
import { statusText } from "./statuspage/Registration";
import { TokenBalance } from "./TokenBalance";

interface DarknodeCardProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
    darknodeID: string;
    darknodeDetails: DarknodeDetails | null;
    name: string | undefined;
}

interface DarknodeCardState {
    network: string;
    success: boolean;
    minBond: number;
    refreshing: boolean;
    correctNetwork: boolean;
    darknodeActionCalled: Map<string, boolean>;
}

class DarknodeCardClass extends React.Component<DarknodeCardProps, DarknodeCardState> {

    public constructor(props: DarknodeCardProps, context: object) {
        super(props, context);
        this.state = {
            network: "",
            success: false,
            minBond: 0,
            refreshing: false,
            correctNetwork: true,
            darknodeActionCalled: Map(),
        };
    }

    public render(): JSX.Element {
        const { darknodeID, darknodeDetails, name, store } = this.props;
        const { quoteCurrency } = store;

        return (
            <Link className="no-underline" to={`/darknode/${darknodeID}`}>
                <div className={`darknode-card ${darknodeDetails && darknodeDetails.registrationStatus === RegistrationStatus.Unregistered ? "darknode-card--faded" : ""}`}>
                    <div className="darknode-card--top" />
                    <div className="darknode-card--middle">

                        <Blocky address={darknodeID} fgColor="#006FE8" bgColor="transparent" />

                        <h3 className="darknode-card--name">{name ? name : <span className="monospace">{darknodeID.substring(0, 8)}...{darknodeID.slice(-5)}</span>}</h3>
                        <span className="darknode-card--status">{darknodeDetails ? statusText[darknodeDetails.registrationStatus] : ""}</span>
                    </div>
                    {darknodeDetails ?
                        <div className="darknode-card--bottom">
                            <div className="darknode-card--rewards">
                                <FontAwesomeIcon icon={faStar} className="darknode-card--bottom--icon" />
                                <span className="currency-value"><CurrencyIcon currency={quoteCurrency} /><TokenBalance token={Token.ETH} convertTo={quoteCurrency} amount={darknodeDetails.feesEarnedTotalEth} /></span> <span className="currency-symbol">{quoteCurrency.toUpperCase()}</span>
                            </div>
                            <div className="darknode-card--gas">
                                <FontAwesomeIcon icon={faFire} className="darknode-card--bottom--icon" />
                                <span className="currency-value"><CurrencyIcon currency={Currency.ETH} /><TokenBalance token={Token.ETH} amount={darknodeDetails.ethBalance} digits={3} /></span> <span className="currency-symbol">ETH</span>
                            </div>
                        </div>
                        : null
                    }
                </div>
            </Link>
        );
    }
}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        quoteCurrency: state.statistics.quoteCurrency,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
    }, dispatch),
});

export const DarknodeCard = connect(mapStateToProps, mapDispatchToProps)(DarknodeCardClass);

