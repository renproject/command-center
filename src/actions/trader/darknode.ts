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


export const approveNode = (sdk: RenExSDK, bond: BigNumber) => async (dispatch: Dispatch) => {

    const ethAddress = sdk.getAddress();

    // tslint:disable-next-line:no-non-null-assertion
    const renAddr = (await sdk._cachedTokenDetails.get(Token.REN))!.addr;
    const ercContract = new (sdk.getWeb3().eth.Contract)(contracts.ERC20.ABI, renAddr);
    const ercBalance = new BigNumber(await ercContract.methods.balanceOf(ethAddress).call());
    const ercAllowance = new BigNumber(await ercContract.methods.allowance(ethAddress, sdk._contracts.darknodeRegistry.address).call());


    if (ercAllowance.gte(bond)) {
        // Already approved
        return;
    }

    if (ercBalance.lt(bond)) {
        throw new Error("You have insufficient REN to register a darknode.");
    }


    return new Promise((resolve, reject) => {
        ercContract.methods.approve(sdk._contracts.darknodeRegistry.address, bond.toFixed()).send({ from: ethAddress })
            .on("transactionHash", resolve)
            .catch(reject);
    });
};

export const registerNode = (sdk: RenExSDK, darknodeID: string, publicKey: string, bond: BigNumber) => async (dispatch: Dispatch) => {


    if (!publicKey) {
        throw new Error("Public key required");
    }

    const ethAddress = sdk.getAddress();

    const hardCodedGas = 500000;

    // tslint:disable-next-line:no-non-null-assertion
    const renAddr = (await sdk._cachedTokenDetails.get(Token.REN))!.addr;
    const ercContract = new (sdk.getWeb3().eth.Contract)(contracts.ERC20.ABI, renAddr);
    const ercAllowance = new BigNumber(await ercContract.methods.allowance(ethAddress, sdk._contracts.darknodeRegistry.address).call());

    let gas: number | undefined = hardCodedGas;
    if (ercAllowance.gte(bond)) {
        gas = undefined;
    }

    await sdk._contracts.darknodeRegistry.register(darknodeID, publicKey, bond.toFixed(),
        { from: sdk.getAddress(), gas, }
    );
};

export const deregisterNode = (sdk: RenExSDK, darknodeID: string) => async (dispatch: Dispatch) => {
    // The node has been registered and can be deregistered.

    await sdk._contracts.darknodeRegistry.deregister(darknodeID, { from: sdk.getAddress() });
};

export const refundNode = (sdk: RenExSDK, darknodeID: string) => async (dispatch: Dispatch) => {
    // The node is awaiting refund.

    await sdk._contracts.darknodeRegistry.refund(darknodeID, { from: sdk.getAddress() });
};

export const fundNode = (sdk: RenExSDK, darknodeID: string, ethAmountStr: string) => (dispatch: Dispatch) => {
    // Convert eth to wei
    const ethAmount = new BigNumber(ethAmountStr);
    const weiAmount = ethAmount.times(new BigNumber(10).exponentiatedBy(18)).decimalPlaces(0);

    return new Promise((resolve, reject) => {
        sdk.getWeb3().eth.sendTransaction({
            to: darknodeID,
            value: weiAmount.toFixed(),
            from: sdk.getAddress(),
        })
            .on("receipt", resolve)
            .on("error", reject);
    });
};
