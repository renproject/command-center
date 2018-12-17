import RenExSDK from "@renex/renex";

import { Dispatch } from "redux";

import contracts from "@Library/contracts/contracts";

import { Token } from "@Library/tokens";
import BigNumber from "bignumber.js";

export const deregisterDarknode = (sdk: RenExSDK, darknodeID: string) => async (dispatch: Dispatch) => {
    await sdk._contracts.darknodeRegistry.deregister(darknodeID, { from: sdk.getAddress(), gas: 200000 });
};

export const withdrawReward = (sdk: RenExSDK, darknodeID: string, token: Token) => async (dispatch: Dispatch) => {

    const contract = new ((sdk.getWeb3()).eth.Contract)(contracts.DarknodeRewardVault.ABI, contracts.DarknodeRewardVault.address);
    const tokenDetails = await sdk._cachedTokenDetails.get(token);

    if (!tokenDetails) {
        throw new Error("Unknown token");
    }

    const ethAddress = await sdk.getWeb3().eth.getAccounts();
    await contract.methods.withdraw(darknodeID, tokenDetails.addr).send({ from: ethAddress[0] });
};


export const ERROR_UNLOCK_METAMASK = "Please unlock your MetaMask wallet.";
export const ERROR_TRANSACTION_FAILED = "Transaction failed, please try again.";

export const approveNode = (sdk: RenExSDK, bond: BigNumber) => async (dispatch: Dispatch) => {

    const ethAddress = await sdk.getWeb3().eth.getAccounts();
    if (!ethAddress[0]) {
        throw new Error(ERROR_UNLOCK_METAMASK);
    }

    // tslint:disable-next-line:no-non-null-assertion
    const renAddr = (await sdk._cachedTokenDetails.get(Token.REN))!.addr;
    const ercContract = new (sdk.getWeb3().eth.Contract)(contracts.ERC20.ABI, renAddr);
    const ercBalance = new BigNumber(await ercContract.methods.balanceOf(ethAddress[0]).call());
    if (ercBalance.lt(bond)) {
        throw new Error("You do not have sufficient REN to register this node.");
    }
    try {
        await ercContract.methods.approve(sdk._contracts.darknodeRegistry.address, bond).send({ from: ethAddress[0] });
    } catch (error) {
        throw new Error(ERROR_TRANSACTION_FAILED);
    }
    return null;
};

export const registerNode = async (sdk: RenExSDK, darknodeID: string, publicKey: string, bond: BigNumber) => async (dispatch: Dispatch) => {

    const ethAddress = await sdk.getWeb3().eth.getAccounts();
    if (!ethAddress[0]) {
        throw new Error(ERROR_UNLOCK_METAMASK);
    }

    if (!publicKey) {
        throw new Error("Public key required");
    }

    try {
        await sdk._contracts.darknodeRegistry.register(darknodeID, publicKey, bond.toString(), { from: ethAddress[0] });
    } catch (error) {
        throw new Error(ERROR_TRANSACTION_FAILED);
    }
    return null;
};

export const deregisterNode = (sdk: RenExSDK, darknodeID: string) => async (dispatch: Dispatch) => {
    // The node has been registered and can be deregistered.
    const ethAddress = await sdk.getWeb3().eth.getAccounts();
    if (!ethAddress[0]) {
        throw new Error(ERROR_UNLOCK_METAMASK);
    }
    const owner = await sdk._contracts.darknodeRegistry.getDarknodeOwner(darknodeID);
    if (owner !== ethAddress[0]) {
        throw new Error("Only the owner can deregister this node.");
    }
    try {
        await sdk._contracts.darknodeRegistry.deregister(darknodeID, { from: ethAddress[0] });
    } catch (error) {
        throw new Error(ERROR_TRANSACTION_FAILED);
    }
    return null;
};

export const refundNode = (sdk: RenExSDK, darknodeID: string) => async (dispatch: Dispatch) => {
    // The node is awaiting refund.
    const ethAddress = await sdk.getWeb3().eth.getAccounts();
    if (!ethAddress[0]) {
        throw new Error(ERROR_UNLOCK_METAMASK);
    }
    const owner = await sdk._contracts.darknodeRegistry.getDarknodeOwner(darknodeID);
    if (owner !== ethAddress[0]) {
        throw new Error("Only the owner can refund the bond for this node.");
    }
    try {
        await sdk._contracts.darknodeRegistry.refund(darknodeID, { from: ethAddress[0] });
    } catch (error) {
        throw new Error(ERROR_TRANSACTION_FAILED);
    }
    return null;
};
