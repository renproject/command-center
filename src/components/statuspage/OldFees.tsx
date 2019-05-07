import * as React from "react";

import { TokenIcon } from "@renex/react-components";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators, Dispatch } from "redux";

import { ApplicationData, DarknodeDetails } from "../../store/types";
import { CurrencyIcon } from "../CurrencyIcon";
import { TokenBalance } from "../TokenBalance";
import { FeesItem } from "./FeesItem";

const OldFeesClass: React.StatelessComponent<Props> = (props) => {
    const { darknodeDetails, store, isOperator } = props;
    const {
        quoteCurrency,
    } = store;

    const oldFees = [];
    if (darknodeDetails) {
        for (const [token, balance] of darknodeDetails.oldFeesEarned.toArray()) {
            const tokenName = token.replace(" (old)", "");
            if (balance.isZero()) {
                continue;
            }
            oldFees.push(<tr key={token}>
                <td>
                    <TokenIcon className="fees-block--table--icon" token={tokenName} />
                    {" "}
                    <span>{tokenName}</span>
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
                        disabled={true}
                        key={token}
                        token={token}
                        amount={balance}
                        darknodeID={darknodeDetails.ID}
                    />
                </td> : <></>}
            </tr>);
        }
    }

    return oldFees.length > 0 ? <>
        <th colSpan={4}>
            Old fees
            </th>
        {oldFees}
    </> : <></>;
};

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        quoteCurrency: state.statistics.quoteCurrency,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
    isOperator: boolean;
    darknodeDetails: DarknodeDetails | null;
}

export const OldFees = connect(mapStateToProps, mapDispatchToProps)(OldFeesClass);
