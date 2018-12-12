import * as React from "react";

import BigNumber from "bignumber.js";
import Web3 from "web3";

import contracts from "./lib/contracts";

import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Token, TokenDetails } from "./lib/tokens";

interface FeesProps {
    web3: Web3;
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
            <button className="withdraw-fees" disabled={this.state.disabled} onClick={this.handleWithdraw}>
                <FontAwesomeIcon icon={faChevronRight} pull="left" />
            </button>
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
