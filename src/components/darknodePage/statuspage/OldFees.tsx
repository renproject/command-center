import * as React from "react";

import { CurrencyIcon, TokenIcon } from "@renproject/react-components";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators } from "redux";

import { ApplicationState, DarknodesState } from "../../../store/applicationState";
import { AppDispatch } from "../../../store/rootReducer";
import { TokenBalance } from "../../common/TokenBalance";
import { FeesItem } from "./FeesItem";

const mapStateToProps = (state: ApplicationState) => ({
    store: {
        quoteCurrency: state.network.quoteCurrency,
    },
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    actions: bindActionCreators({
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
    isOperator: boolean;
    darknodeDetails: DarknodesState | null;
}

export const OldFees = connect(mapStateToProps, mapDispatchToProps)(
    (props: Props) => {
        const { darknodeDetails, store, isOperator } = props;
        const {
            quoteCurrency,
        } = store;

        const oldFees = [];
        if (darknodeDetails) {
            for (const [token, balance] of darknodeDetails.oldFeesEarned.toArray()) {
                if (balance.isZero()) {
                    continue;
                }
                oldFees.push(<tr key={token}>
                    <td>
                        <TokenIcon className="fees-block--table--icon" token={token} />
                        {" "}
                        <span>{token}</span>
                    </td>
                    <td className="fees-block--table--value">
                        <TokenBalance token={token} amount={balance} />
                    </td>
                    <td className="fees-block--table--usd">
                        <CurrencyIcon currency={quoteCurrency} />
                        <TokenBalance
                            token={token}
                            amount={balance}
                            convertTo={quoteCurrency}
                        />
                        {" "}
                        <span className="fees-block--table--usd-symbol">
                            {quoteCurrency.toUpperCase()}
                        </span>
                    </td>
                    {isOperator ? <td>
                        <FeesItem
                            key={token}
                            token={token}
                            amount={balance}
                            darknodeID={darknodeDetails.ID}
                            disabled={false}
                        />
                    </td> : <></>}
                </tr>);
            }
        }

        return oldFees.length > 0 ? <>
            <tr className="tr">
                <td colSpan={4}>
                    Old fees
            </td>
            </tr>
            {oldFees}
        </> : <></>;
    }
);
