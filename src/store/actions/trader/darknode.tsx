import * as React from "react";

import BigNumber from "bignumber.js";
import Web3 from "web3";

import { decode as decode58 } from "bs58";
import { Dispatch } from "redux";
import { Contract } from "web3-eth-contract";

import { WithdrawPopup } from "../../../components/popups/WithdrawPopup";
import { _noCapture_ } from "../../../lib/errors";
import { DarknodePaymentWeb3 } from "../../../lib/ethereum/contracts/bindings/darknodePayment";
import { DarknodeRegistryWeb3 } from "../../../lib/ethereum/contracts/bindings/darknodeRegistry";
import { contracts } from "../../../lib/ethereum/contracts/contracts";
import { AllTokenDetails, OldToken, RENAddress, Token } from "../../../lib/ethereum/tokens";
import { clearPopup, setPopup } from "../popup/popupActions";
import { waitForTX } from "../statistics/operatorActions";

export const bridgedToken = (web3: Web3, address: string): Contract => {
    return new web3.eth.Contract(contracts.WarpGateToken.ABI, address);
};

export const zBTCAddress = "0x2a8368d2a983a0aeae8da0ebc5b7c03a0ea66b37";
export const zZECAddress = "0xd67256552f93b39ac30083b4b679718a061feae6";
export const btcAddressToHex = (address: string) => `0x${decode58(address).toString("hex")}`;
export const zecAddressToHex = (address: string) => `0x${decode58(address).toString("hex")}`;

const burn = (web3: Web3, trader: string, currency: Token, to: string) => async (dispatch: Dispatch) => {
    const contract = currency === Token.BTC ? bridgedToken(web3, zBTCAddress) :
        currency === Token.ZEC ? bridgedToken(web3, zZECAddress) :
            undefined;

    if (contract === undefined) {
        throw new Error("Something went wrong, please reload and try again");
    }

    const toHex = currency === Token.BTC ? btcAddressToHex(to) :
        currency === Token.ZEC ? zecAddressToHex(to) :
            to;

    const amount = new BigNumber((await contract.methods.balanceOf(trader)).toString());

    console.log(`Burning: ${amount.toString()} ${currency}`);

    await waitForTX(
        contract.methods.burn(toHex, amount /* new BigNumber(amount).multipliedBy(10 ** 8).toFixed() */).send({ from: trader })
    )(dispatch);
};

export const withdrawReward = (web3: Web3, trader: string, darknodeID: string, token: Token | OldToken) => async (dispatch: Dispatch) => new Promise(async (resolve, reject) => {

    const tokenDetails = AllTokenDetails.get(token);
    if (tokenDetails === undefined) {
        reject(new Error("Unknown token"));
        return;
    }

    if (tokenDetails.old) {
        try {
            const contract = new (web3.eth.Contract)(
                contracts.DarknodeRewardVault.ABI,
                contracts.DarknodeRewardVault.address
            );
            await waitForTX(
                contract.methods.withdraw(darknodeID, tokenDetails.address).send({ from: trader }),
                resolve,
            )(dispatch);
        } catch (error) {
            reject(error);
            return;
        }
    } else {
        const withdraw = async (withdrawAddress?: string) => {

            const darknodePayment: DarknodePaymentWeb3 = new (web3.eth.Contract)(
                contracts.DarknodePayment.ABI,
                contracts.DarknodePayment.address
            );

            if (!tokenDetails) {
                throw new Error("Unknown token");
            }

            await waitForTX(
                darknodePayment.methods.withdraw(darknodeID, tokenDetails.address).send({ from: trader }),
                resolve,
            )(dispatch);

            if (tokenDetails.wrapped) {
                if (!withdrawAddress) {
                    throw new Error("Invalid withdraw address");
                }
                await burn(web3, trader, token as Token, withdrawAddress)(dispatch);
            }
        };
        const onCancel = () => {
            dispatch(clearPopup());
            reject();
        };
        const onDone = () => {
            dispatch(clearPopup());
            resolve();
        };
        if (tokenDetails.wrapped) {
            dispatch(setPopup(
                {
                    popup: <WithdrawPopup
                        token={token as Token}
                        withdraw={withdraw}
                        onDone={onDone}
                        onCancel={onCancel}
                    />,
                    onCancel,
                    overlay: true,
                },
            ));
        } else {
            try {
                await withdraw();
            } catch (error) {
                onCancel();
            }
        }
    }
});

export const approveNode = (web3: Web3, trader: string, bond: BigNumber) => async (dispatch: Dispatch) => {
    // tslint:disable-next-line:no-non-null-assertion
    const ercContract = new (web3.eth.Contract)(contracts.ERC20.ABI, RENAddress);
    const ercBalance = new BigNumber(await ercContract.methods.balanceOf(trader).call());
    const ercAllowance = new BigNumber(
        await ercContract.methods.allowance(trader, contracts.DarknodeRegistry.address).call(),
    );

    if (ercAllowance.gte(bond)) {
        // Already approved
        return;
    }

    if (ercBalance.lt(bond)) {
        throw _noCapture_(new Error("You have insufficient REN to register a darknode."));
    }

    return waitForTX(
        ercContract.methods.approve(contracts.DarknodeRegistry.address, bond.toFixed()).send({ from: trader })
    )(dispatch);
};

export const registerNode = (
    web3: Web3,
    trader: string,
    darknodeID: string,
    publicKey: string,
    bond: BigNumber,
    onCancel: () => void,
    onDone: () => void
) => async (dispatch: Dispatch): Promise<string> => {

    const hardCodedGas = 500000;

    // tslint:disable-next-line:no-non-null-assertion
    const ercContract = new (web3.eth.Contract)(contracts.ERC20.ABI, RENAddress);

    const ercAllowance = new BigNumber(
        await ercContract.methods.allowance(trader, contracts.DarknodeRegistry.address).call()
    );

    let gas: number | undefined = hardCodedGas;
    if (ercAllowance.gte(bond)) {
        gas = undefined;
    }

    let resolved = false;
    const darknodeRegistry: DarknodeRegistryWeb3 = new (web3.eth.Contract)(
        contracts.DarknodeRegistry.ABI,
        contracts.DarknodeRegistry.address
    );

    try {
        const res = await waitForTX(
            darknodeRegistry.methods.register(darknodeID, publicKey).send({ from: trader, gas }),
            onDone
        )(dispatch);
        resolved = true;
        return res;
    } catch (error) {
        if (resolved) { onCancel(); }
        throw error;
    }
};

export const deregisterNode = (
    web3: Web3,
    trader: string,
    darknodeID: string,
    onCancel: () => void,
    onDone: () => void
) => async (dispatch: Dispatch): Promise<string> => {
    // The node has been registered and can be deregistered.

    let resolved = false;
    const darknodeRegistry = new ((web3).eth.Contract)(
        contracts.DarknodeRegistry.ABI,
        contracts.DarknodeRegistry.address
    );
    try {
        const res = await waitForTX(
            darknodeRegistry.methods.deregister(darknodeID).send({ from: trader }),
            onDone
        )(dispatch);
        resolved = true;
        return res;
    } catch (error) {
        if (resolved) { onCancel(); }
        throw error;
    }
};

export const refundNode = (
    web3: Web3,
    trader: string,
    darknodeID: string,
    onCancel: () => void,
    onDone: () => void
) => async (dispatch: Dispatch): Promise<string> => {
    // The node is awaiting refund.

    let resolved = false;
    const darknodeRegistry: DarknodeRegistryWeb3 = new (web3.eth.Contract)(
        contracts.DarknodeRegistry.ABI,
        contracts.DarknodeRegistry.address
    );

    try {
        const res = await waitForTX(
            darknodeRegistry.methods.refund(darknodeID).send({ from: trader }),
            onDone
        )(dispatch);
        resolved = true;
        return res;
    } catch (error) {
        if (resolved) { onCancel(); }
        throw error;
    }
};

export const fundNode = (
    web3: Web3,
    address: string,
    darknodeID: string,
    ethAmountStr: string,
    onCancel: () => void,
    onDone: () => void
) => async (dispatch: Dispatch): Promise<string> => {
    // Convert eth to wei
    const ethAmount = new BigNumber(ethAmountStr);
    const weiAmount = ethAmount.times(new BigNumber(10).exponentiatedBy(18)).decimalPlaces(0);

    let resolved = false;

    const call = () => web3.eth.sendTransaction({
        to: darknodeID,
        value: weiAmount.toFixed(),
        from: address,
    });

    try {
        const res = await waitForTX(
            call(),
            onDone
        )(dispatch);
        resolved = true;
        return res;
    } catch (error) {
        if (resolved) { onCancel(); }
        throw error;
    }
};

export const claimForNode = (
    web3: Web3,
    address: string,
    darknodeID: string,
    onCancel: () => void,
    onDone: () => void
) => async (dispatch: Dispatch): Promise<string> => {
    // Convert eth to wei

    const darknodePayment: DarknodePaymentWeb3 = new (web3.eth.Contract)(
        contracts.DarknodePayment.ABI,
        contracts.DarknodePayment.address
    );

    let resolved = false;

    const call = () => darknodePayment.methods.claim(darknodeID).send({ from: address });

    try {
        const res = await waitForTX(
            call(),
            onDone
        )(dispatch);
        resolved = true;
        return res;
    } catch (error) {
        if (resolved) { onCancel(); }
        throw error;
    }
};
