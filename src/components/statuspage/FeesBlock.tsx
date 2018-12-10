import * as React from "react";

import Web3 from "web3";

import contracts from "./lib/contracts";
import { Token, TokenDetails } from "./lib/tokens";
import { TokenBalance } from "./TokenBalance";

interface FeesProps {
    web3: Web3;
    token: Token;
    amount: string;
    darknodeAddress: string;
    network: string;
}

interface FeesState {
    disabled: boolean;
}

export class FeesBlock extends React.Component<FeesProps, FeesState> {
    constructor(props: FeesProps) {
        super(props);
        this.state = {
            disabled: parseFloat(this.props.amount) <= 0
        };
    }

    public render(): JSX.Element {
        return (
            <div className="fees">
                <TokenBalance token={this.props.token} amount={this.props.amount} />
                <button disabled={this.state.disabled} onClick={this.handleWithdraw}>
                    <span>Withdraw</span>
                </button>
            </div>
        );
    }

    private handleWithdraw = async (): Promise<void> => {
        this.setState({ disabled: true });
        const contract = new this.props.web3.eth.Contract(contracts.DarknodeRewardVault.ABI, contracts.DarknodeRewardVault.address);
        // tslint:disable-next-line:no-non-null-assertion
        const tokenAddress = TokenDetails.get(this.props.token)!.address;
        const ethAddress = await this.props.web3.eth.getAccounts();
        await contract.methods.withdraw(this.props.darknodeAddress, tokenAddress).send({ from: ethAddress[0] });
    }
}
