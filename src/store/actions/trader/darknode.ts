import RenExSDK from "@renex/renex";
import BigNumber from "bignumber.js";

import { Dispatch } from "redux";

import { _noCapture_ } from "../../../lib/errors";
import { contracts } from "../../../lib/ethereum/contracts/contracts";
import { Token } from "../../../lib/ethereum/tokens";

export const withdrawReward = (sdk: RenExSDK, trader: string, darknodeID: string, token: Token) => async (_dispatch: Dispatch) => {

    const contract = new ((sdk.getWeb3()).eth.Contract)(
        contracts.DarknodeRewardVault.ABI,
        contracts.DarknodeRewardVault.address
    );
    const tokenDetails = await sdk._cachedTokenDetails.get(token);

    if (!tokenDetails) {
        throw new Error("Unknown token");
    }

    await contract.methods.withdraw(darknodeID, tokenDetails.addr).send({ from: trader });
};

export const approveNode = (sdk: RenExSDK, trader: string, bond: BigNumber) => async (_dispatch: Dispatch) => {

    // tslint:disable-next-line:no-non-null-assertion
    const renAddr = (await sdk._cachedTokenDetails.get(Token.REN))!.addr;
    const ercContract = new (sdk.getWeb3().eth.Contract)(contracts.ERC20.ABI, renAddr);
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
    sdk: RenExSDK,
    trader: string,
    darknodeID: string,
    publicKey: string,
    bond: BigNumber,
    onCancel: () => void,
    onDone: () => void
) => async (_dispatch: Dispatch) => {

    const hardCodedGas = 500000;

    // tslint:disable-next-line:no-non-null-assertion
    const renAddr = (await sdk._cachedTokenDetails.get(Token.REN))!.addr;
    const ercContract = new (sdk.getWeb3().eth.Contract)(contracts.ERC20.ABI, renAddr);

    const ercAllowance = new BigNumber(
        await ercContract.methods.allowance(trader, contracts.DarknodeRegistry.address).call()
    );

    let gas: number | undefined = hardCodedGas;
    if (ercAllowance.gte(bond)) {
        gas = undefined;
    }

    let resolved = false;
    const darknodeRegistry = new ((sdk.getWeb3()).eth.Contract)(
        contracts.DarknodeRegistry.ABI,
        contracts.DarknodeRegistry.address
    );
    return new Promise(((
        resolve: (value: string) => void,
        reject: (reason: Error | string) => void,
    ) => {
        darknodeRegistry.methods.register(darknodeID, publicKey, bond.toFixed()).send({ from: trader, gas })
            .on("transactionHash", (res: string) => { resolve(res); resolved = true; })
            .once("confirmation", onDone)
            .on("error", (error: Error) => { if (resolved) { onCancel(); } reject(error); });
    }));
};

export const deregisterNode = (
    sdk: RenExSDK,
    trader: string,
    darknodeID: string,
    onCancel: () => void,
    onDone: () => void
) => async (_dispatch: Dispatch) => {
    // The node has been registered and can be deregistered.

    let resolved = false;
    const darknodeRegistry = new ((sdk.getWeb3()).eth.Contract)(
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
    sdk: RenExSDK,
    trader: string,
    darknodeID: string,
    onCancel: () => void,
    onDone: () => void
) => async (_dispatch: Dispatch) => {
    // The node is awaiting refund.

    let resolved = false;
    const darknodeRegistry = new ((sdk.getWeb3()).eth.Contract)(
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
    sdk: RenExSDK,
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
        sdk.getWeb3().eth.sendTransaction({
            to: darknodeID,
            value: weiAmount.toFixed(),
            from: address,
        })
            .on("transactionHash", (res: string) => { resolve(res); resolved = true; })
            .once("confirmation", onDone)
            .on("error", (error: Error) => { if (resolved) { onCancel(); } reject(error); });
    });
};