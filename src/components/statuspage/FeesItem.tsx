import * as React from "react";

import BigNumber from "bignumber.js";
import Web3 from "web3";

import contracts from "./lib/contracts";

import RenExSDK from "@renex/renex";

import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Token } from "./lib/tokens";

interface FeesProps {
    operator: boolean;
    sdk: RenExSDK;
    token: Token;
    amount: string | BigNumber;
    darknodeAddress: string;
}

interface FeesState {
    disabled: boolean;
}

export class FeesItem extends React.Component<FeesProps, FeesState> {
    constructor(props: FeesProps) {
        super(props);
        this.state = {
            disabled: (new BigNumber(this.props.amount)).lt(0)
        };
    }

    public render(): JSX.Element {
        return (
            <button className="withdraw-fees" disabled={this.state.disabled || !this.props.operator} onClick={this.handleWithdraw}>
                <FontAwesomeIcon icon={faChevronRight} pull="left" />
            </button>
        );
    }

    private handleWithdraw = async (): Promise<void> => {
        const { sdk } = this.props;
        this.setState({ disabled: true });
        const contract = new ((sdk.getWeb3()).eth.Contract)(contracts.DarknodeRewardVault.ABI, contracts.DarknodeRewardVault.address);
        // tslint:disable-next-line:no-non-null-assertion
        const tokenDetails = await sdk._cachedTokenDetails.get(this.props.token);

        if (!tokenDetails) {
            throw new Error("Unknown token");
        }

        const ethAddress = await sdk.getWeb3().eth.getAccounts();
        await contract.methods.withdraw(this.props.darknodeAddress, tokenDetails.addr).send({ from: ethAddress[0] });
    }
}
