import * as React from "react";

import { faStar } from "@fortawesome/free-regular-svg-icons";
import { faFire, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { Link } from "react-router-dom";
import { bindActionCreators, Dispatch } from "redux";

import { RegistrationStatus, removeRegisteringDarknode } from "../actions/statistics/operatorActions";
import { Token } from "../lib/ethereum/tokens";
import { ApplicationData, Currency, DarknodeDetails } from "../reducers/types";
import { Blocky } from "./Blocky";
import { CurrencyIcon } from "./CurrencyIcon";
import { DarknodeID } from "./DarknodeID";
import { darknodeIDHexToBase58 } from "./pages/Darknode";
import { statusText } from "./statuspage/Registration";
import { TokenBalance } from "./TokenBalance";

class DarknodeCardClass extends React.Component<Props, State> {

    public constructor(props: Props, context: object) {
        super(props, context);
        this.state = {
        };
    }

    public render = (): JSX.Element => {
        const { darknodeID, darknodeDetails, name, store, publicKey } = this.props;
        const { quoteCurrency } = store;

        // If we have the public key and the status is unregistered (or the status is not available yet), then link to
        // the registration page
        const continuable = publicKey && (
            !darknodeDetails ||
            darknodeDetails.registrationStatus === RegistrationStatus.Unregistered
        );

        const faded = darknodeDetails &&
            darknodeDetails.registrationStatus === RegistrationStatus.Unregistered &&
            !continuable;

        const darknodeIDBase58 = darknodeIDHexToBase58(darknodeID);

        const url = continuable ?
            `/darknode/${darknodeIDBase58}?action=register&public_key=${publicKey}` :
            `/darknode/${darknodeIDBase58}`;

        return (
            <Link className="no-underline" to={url}>
                <div className={`darknode-card ${faded ? "darknode-card--faded" : ""}`}>
                    <div className="darknode-card--top">
                        {continuable ? <div role="button" className="card--hide" onClick={this.removeRegisteringDarknode}>
                            <FontAwesomeIcon icon={faTimes} pull="left" />
                        </div> : null}
                    </div>
                    <div className="darknode-card--middle">

                        <Blocky address={darknodeID} fgColor="#006FE8" bgColor="transparent" />

                        <h3 className="darknode-card--name">{name ? name : <DarknodeID darknodeID={darknodeID} />}</h3>
                        <span className="darknode-card--status">
                            {continuable ? "Continue registering" : darknodeDetails ?
                                statusText[darknodeDetails.registrationStatus] :
                                ""
                            }
                        </span>
                    </div>
                    {darknodeDetails ?
                        <div className="darknode-card--bottom">
                            <div className="darknode-card--rewards">
                                <FontAwesomeIcon icon={faStar} className="darknode-card--bottom--icon" />
                                <span className="currency-value">
                                    <CurrencyIcon currency={quoteCurrency} />
                                    <TokenBalance
                                        token={Token.ETH}
                                        convertTo={quoteCurrency}
                                        amount={darknodeDetails.feesEarnedTotalEth}
                                    />
                                </span>
                                {" "}
                                <span className="currency-symbol">{quoteCurrency.toUpperCase()}</span>
                            </div>
                            <div className="darknode-card--gas">
                                <FontAwesomeIcon icon={faFire} className="darknode-card--bottom--icon" />
                                <span className="currency-value">
                                    <CurrencyIcon currency={Currency.ETH} />
                                    <TokenBalance token={Token.ETH} amount={darknodeDetails.ethBalance} digits={3} />
                                </span>
                                {" "}
                                <span className="currency-symbol">ETH</span>
                            </div>
                        </div>
                        : null
                    }
                </div>
            </Link>
        );
    }

    private readonly removeRegisteringDarknode = async (e: React.MouseEvent<HTMLDivElement>): Promise<void> => {
        e.stopPropagation();
        e.preventDefault();
        const { darknodeID } = this.props;
        // tslint:disable-next-line: await-promise
        await this.props.actions.removeRegisteringDarknode({ darknodeID });
    }
}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        quoteCurrency: state.statistics.quoteCurrency,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        removeRegisteringDarknode,
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
    darknodeID: string;
    darknodeDetails: DarknodeDetails | null;
    name: string | undefined;
    publicKey: string | undefined;
}

interface State {
}

export const DarknodeCard = connect(mapStateToProps, mapDispatchToProps)(DarknodeCardClass);
