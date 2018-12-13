import * as React from "react";

import BigNumber from "bignumber.js";

import { Map } from "immutable";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { Blocky } from "@Components/Blocky";

import { storeSelectedDarknode } from "@Actions/statistics/operatorActions";
import { ApplicationData, Currency, DarknodeDetails } from "@Reducers/types";
import { Token } from "./statuspage/lib/tokens";
import { TokenBalance } from "./statuspage/TokenBalance";

const toTitleCase = (title: string) => title.replace(
    /\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
);

interface DarknodeCardProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
    darknodeID: string;
    darknodeDetails: DarknodeDetails | null;
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
        const { darknodeID, darknodeDetails } = this.props;

        return (
            <div className="darknode-card" onClick={this.onClick}>
                <div className="darknode-card--top" />
                <div className="darknode-card--middle">

                    <Blocky address={darknodeID} />
                    <h3 className="darknode-card--name">Darknode</h3>
                    <span className="darknode-card--status">{darknodeDetails ? toTitleCase(darknodeDetails.registrationStatus) : ""}</span>
                </div>
                {darknodeDetails ?
                    <div className="darknode-card--bottom">
                        <div className="darknode-card--rewards">
                            <td className="fees-block--table--usd">$<TokenBalance token={Token.ETH} convertTo={Currency.USD} amount={darknodeDetails.feesEarnedTotalEth} /> <span className="fees-block--table--usd-symbol">USD</span></td>
                        </div>
                        <div className="darknode-card--fees">
                            <TokenBalance token={Token.ETH} amount={darknodeDetails.ethBalance} digits={3} /> ETH
                    </div>
                    </div>
                    : null
                }
            </div>
        );
    }

    public onClick = (e: React.MouseEvent<HTMLDivElement>) => {
        this.props.actions.storeSelectedDarknode({ selectedDarknode: this.props.darknodeID });
    }
}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        tokenPrices: state.statistics.tokenPrices,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        storeSelectedDarknode,
    }, dispatch),
});

export const DarknodeCard = connect(mapStateToProps, mapDispatchToProps)(DarknodeCardClass);

