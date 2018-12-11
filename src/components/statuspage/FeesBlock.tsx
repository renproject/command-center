import * as React from "react";

import RenExSDK from "@renex/renex";

import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { ApplicationData, DarknodeDetails } from "@Reducers/types";
import { FeesItem } from "./FeesItem";
import { Token } from "./lib/tokens";

interface StoreProps {
}

interface FeesBlockProps extends StoreProps {
    sdk: RenExSDK;
    darknodeDetails: DarknodeDetails;

    actions: {
    };
}

interface FeesBlockState {
}

class FeesBlockClass extends React.Component<FeesBlockProps, FeesBlockState> {

    public constructor(props: FeesBlockProps, context: object) {
        super(props, context);
        this.state = {
        };
    }

    public render(): JSX.Element {
        const { sdk, darknodeDetails } = this.props;

        return (

            <div className="block fees-block">
                <div className="block--title">
                    <h3>Darknode Income</h3>
                </div>
                {
                    darknodeDetails.feesEarned.map((balance: string, token: Token) => {
                        return (
                            <FeesItem key={token} web3={sdk.getWeb3()} token={token} amount={balance} darknodeAddress={darknodeDetails.ID} />
                        );
                    }).valueSeq().toArray()
                }
            </div>

        );
    }

}

function mapStateToProps(state: ApplicationData): StoreProps {
    return {
    };
}

function mapDispatchToProps(dispatch: Dispatch): { actions: FeesBlockProps["actions"] } {
    return {
        actions: bindActionCreators({
        }, dispatch)
    };
}

export const FeesBlock = connect(mapStateToProps, mapDispatchToProps)(FeesBlockClass);

