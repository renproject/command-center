import * as React from "react";

import BigNumber from "bignumber.js";
import Web3 from "web3";

import { decode as decode58 } from "bs58";
import { Dispatch } from "redux";
import { Contract } from "web3-eth-contract";

import { WithdrawPopup } from "../../../components/popups/WithdrawPopup";
import { _noCapture_ } from "../../../lib/errors";
import { DarknodeRegistryWeb3 } from "../../../lib/ethereum/contracts/bindings/darknodeRegistry";
import { contracts } from "../../../lib/ethereum/contracts/contracts";
import { AllTokenDetails, OldToken, RENAddress, Token } from "../../../lib/ethereum/tokens";
import { clearPopup, setPopup } from "../popup/popupActions";

export const bridgedToken = (web3: Web3, address: string): Contract => {
    return new web3.eth.Contract(contracts.WarpGateToken.ABI, address);
};

export const zBTCAddress = "0x2a8368d2a983a0aeae8da0ebc5b7c03a0ea66b37";
export const zZECAddress = "0xd67256552f93b39ac30083b4b679718a061feae6";
export const btcAddressToHex = (address: string) => `0x${decode58(address).toString("hex")}`;
export const zecAddressToHex = (address: string) => `0x${decode58(address).toString("hex")}`;

const burn = async (web3: Web3, trader: string, currency: Token, to: string) => {
    const contract = currency === Token.BTC ? bridgedToken(web3, zBTCAddress) :
        currency === Token.ZEC ? bridgedToken(web3, zZECAddress) :
            undefined;

    if (contract === undefined) {
        throw new Error("Something went wrong, please reload and try again");
    }

    const toHex = currency === Token.BTC ? btcAddressToHex(to) :
        currency === Token.ZEC ? zecAddressToHex(to) :
            to;

    const amount = await contract.methods.balanceOf(trader);

    await contract.methods.burn(toHex, amount /* new BigNumber(amount).multipliedBy(10 ** 8).toFixed() */).send({ from: trader });
    console.log("Returned from burn call.");
};

export const withdrawReward = (web3: Web3, trader: string, darknodeID: string, token: Token | OldToken) => async (dispatch: Dispatch) => new Promise(async (resolve, reject) => {

    const details = AllTokenDetails.get(token);
    if (details === undefined) {
        reject(new Error("Unknown token"));
        return;
    }

    if (details.old) {
        try {
            const contract = new (web3.eth.Contract)(
                contracts.DarknodeRewardVault.ABI,
                contracts.DarknodeRewardVault.address
            );
            await contract.methods.withdraw(darknodeID, details.address).send({ from: trader });
        } catch (error) {
            reject(error);
            return;
        }

        resolve();
        return;
    } else {
        const withdraw = async (withdrawAddress: string) => {

            // const darknodePayment: DarknodePaymentWeb3 = new (web3.eth.Contract)(
            //     contracts.DarknodePayment.ABI,
            //     contracts.DarknodePayment.address
            // );
            // const tokenDetails = TokenDetails.get(token);

            // if (!tokenDetails) {
            //     throw new Error("Unknown token");
            // }

            // await darknodePayment.methods.withdraw(darknodeID, tokenDetails.address).send({ from: trader });

            await burn(web3, trader, token as Token, withdrawAddress);
        };
        const onCancel = () => {
            dispatch(clearPopup());
            reject();
        };
        const onDone = () => {
            dispatch(clearPopup());
            resolve();
        };
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
    }
});

export const approveNode = (web3: Web3, trader: string, bond: BigNumber) => async (_dispatch: Dispatch) => {
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

    return new Promise((
        resolve: (value: string) => void,
        reject: (reason: Error | string) => void,
    ) => {
        ercContract.methods.approve(contracts.DarknodeRegistry.address, bond.toFixed()).send({ from: trader })
            .on("transactionHash", resolve)
            .catch(reject);
    });
};

export const registerNode = (
    web3: Web3,
    trader: string,
    darknodeID: string,
    publicKey: string,
    bond: BigNumber,
    onCancel: () => void,
    onDone: () => void
) => async (_dispatch: Dispatch) => {

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
    return new Promise(((
        resolve: (value: string) => void,
        reject: (reason: Error | string) => void,
    ) => {
        darknodeRegistry.methods.register(darknodeID, publicKey).send({ from: trader, gas })
            .on("transactionHash", (res: string) => { resolve(res); resolved = true; })
            .once("confirmation", onDone)
            .on("error", (error: Error) => { if (resolved) { onCancel(); } reject(error); });
    }));
};

export const deregisterNode = (
    web3: Web3,
    trader: string,
    darknodeID: string,
    onCancel: () => void,
    onDone: () => void
) => async (_dispatch: Dispatch) => {
    // The node has been registered and can be deregistered.

    let resolved = false;
    const darknodeRegistry = new ((web3).eth.Contract)(
        contracts.DarknodeRegistry.ABI,
        contracts.DarknodeRegistry.address
    );
    return new Promise((
        resolve: (value: string) => void,
        reject: (reason: Error | string) => void,
    ) => {
        darknodeRegistry.methods.deregister(darknodeID).send({ from: trader })
            .on("transactionHash", (res: string) => { resolve(res); resolved = true; })
            .once("confirmation", onDone)
            .on("error", (error: Error) => { if (resolved) { onCancel(); } reject(error); });
    });
};

export const refundNode = (
    web3: Web3,
    trader: string,
    darknodeID: string,
    onCancel: () => void,
    onDone: () => void
) => async (_dispatch: Dispatch) => {
    // The node is awaiting refund.

    let resolved = false;
    const darknodeRegistry: DarknodeRegistryWeb3 = new (web3.eth.Contract)(
        contracts.DarknodeRegistry.ABI,
        contracts.DarknodeRegistry.address
    );
    return new Promise((
        resolve: (value: string) => void,
        reject: (reason: Error | string) => void,
    ) => {
        darknodeRegistry.methods.refund(darknodeID).send({ from: trader })
            .on("transactionHash", (res: string) => { resolve(res); resolved = true; })
            .once("confirmation", onDone)
            .on("error", (error: Error) => { if (resolved) { onCancel(); } reject(error); });
    });

};

export const fundNode = (
    web3: Web3,
    address: string,
    darknodeID: string,
    ethAmountStr: string,
    onCancel: () => void,
    onDone: () => void
) => async (_dispatch: Dispatch): Promise<string> => {
    // Convert eth to wei
    const ethAmount = new BigNumber(ethAmountStr);
    const weiAmount = ethAmount.times(new BigNumber(10).exponentiatedBy(18)).decimalPlaces(0);

    let resolved = false;
    return new Promise((
        resolve: (value: string) => void,
        reject: (reason: Error | string) => void,
    ) => {
        web3.eth.sendTransaction({
            to: darknodeID,
            value: weiAmount.toFixed(),
            from: address,
        })
            .on("transactionHash", (res: string) => { resolve(res); resolved = true; })
            .once("confirmation", onDone)
            .on("error", (error: Error) => { if (resolved) { onCancel(); } reject(error); });
    });
};
