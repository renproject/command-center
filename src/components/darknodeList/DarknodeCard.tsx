import * as React from "react";

import { faStar } from "@fortawesome/free-regular-svg-icons";
import { faFire, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { Link } from "react-router-dom";
import { bindActionCreators, Dispatch } from "redux";

import { Blocky } from "@renex/react-components";
import { Token } from "../../lib/ethereum/tokens";
import { RegistrationStatus, removeDarknode, removeRegisteringDarknode } from "../../store/actions/statistics/operatorActions";
import { ApplicationData, Currency, DarknodeDetails } from "../../store/types";
import { CurrencyIcon } from "../CurrencyIcon";
import { DarknodeID } from "../DarknodeID";
import { darknodeIDHexToBase58 } from "../pages/Darknode";
import { statusText } from "../statuspage/Registration";
import { TokenBalance } from "../TokenBalance";

const defaultState = {
    confirmedRemove: false,
};

class DarknodeCardClass extends React.Component<Props, typeof defaultState> {

    public constructor(props: Props, context: object) {
        super(props, context);
        this.state = defaultState;
    }

    public render = (): JSX.Element => {
        const { darknodeID, darknodeDetails, name, store, publicKey } = this.props;
        const { quoteCurrency } = store;
        const { confirmedRemove } = this.state;

        // If we have the public key and the status is unregistered (or the status is not available yet), then link to
        // the registration page
        const continuable = publicKey && (
            !darknodeDetails ||
            darknodeDetails.registrationStatus === RegistrationStatus.Unregistered
        );

        const faded = darknodeDetails &&
            darknodeDetails.registrationStatus === RegistrationStatus.Unregistered &&
            !continuable;

        const hidable = (darknodeDetails && darknodeDetails.registrationStatus === RegistrationStatus.Unregistered) || continuable;

        const darknodeIDBase58 = darknodeIDHexToBase58(darknodeID);

        const url = continuable ?
            `/darknode/${darknodeIDBase58}?action=register&public_key=${publicKey}` :
            `/darknode/${darknodeIDBase58}`;

        return (
            <Link className="no-underline" to={url}>
                <div className={`darknode-card ${faded ? "darknode-card--faded" : ""}`}>
                    <div className="darknode-card--top">
                        {hidable ? <div role="button" className="card--hide" onClick={this.removeDarknode}>
                            {confirmedRemove ? "Are you sure?" : <FontAwesomeIcon icon={faTimes} pull="left" />}
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

    private readonly removeDarknode = (e: React.MouseEvent<HTMLDivElement>): void => {
        e.stopPropagation();
        e.preventDefault();

        const { confirmedRemove } = this.state;

        if (!confirmedRemove) {
            this.setState({ confirmedRemove: true });
            return;
        }

        const { darknodeID, darknodeDetails, publicKey, store: { address } } = this.props;

        // If we have the public key and the status is unregistered (or the status is not available yet), then link to
        // the registration page
        const continuable = publicKey && (
            !darknodeDetails ||
            darknodeDetails.registrationStatus === RegistrationStatus.Unregistered
        );

        // tslint:disable-next-line: await-promise
        if (continuable) {
            this.props.actions.removeRegisteringDarknode({ darknodeID });
        } else if (address) {
            this.props.actions.removeDarknode({ darknodeID, operator: address });
        }

    }
}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        address: state.trader.address,
        quoteCurrency: state.statistics.quoteCurrency,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        removeRegisteringDarknode,
        removeDarknode,
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
    darknodeID: string;
    darknodeDetails: DarknodeDetails | null;
    name: string | undefined;
    publicKey: string | undefined;
}

export const DarknodeCard = connect(mapStateToProps, mapDispatchToProps)(DarknodeCardClass);
