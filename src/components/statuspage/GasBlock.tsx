import * as React from "react";

import RenExSDK from "@renex/renex";

import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { ApplicationData, DarknodeDetails } from "@Reducers/types";
import { Token } from "./lib/tokens";
import { TokenBalance } from "./TokenBalance";
import { Topup } from "./Topup";

interface StoreProps {
}

interface GasBlockProps extends StoreProps {
    sdk: RenExSDK;
    darknodeDetails: DarknodeDetails;

    actions: {
    };
}

interface GasBlockState {
}

class GasBlockClass extends React.Component<GasBlockProps, GasBlockState> {

    public constructor(props: GasBlockProps, context: object) {
        super(props, context);
        this.state = {
        };
    }

    public render(): JSX.Element {
        const { sdk, darknodeDetails } = this.props;

        return (

            <div className="block gas-block">
                <div className="block--title">
                    <h3>Fees</h3>
                </div>
                <TokenBalance token={Token.ETH} amount={darknodeDetails.ethBalance.toString()} min={0} />
                <p>Top-up Balance</p>
                <Topup web3={sdk.getWeb3()} darknodeAddress={darknodeDetails.ID} />
            </div>

        );
    }

}

function mapStateToProps(state: ApplicationData): StoreProps {
    return {
    };
}

function mapDispatchToProps(dispatch: Dispatch): { actions: GasBlockProps["actions"] } {
    return {
        actions: bindActionCreators({
        }, dispatch)
    };
}

export const GasBlock = connect(mapStateToProps, mapDispatchToProps)(GasBlockClass);

