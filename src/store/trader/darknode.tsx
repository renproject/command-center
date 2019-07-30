import * as React from "react";

// import { decode as decode58 } from "bs58";
import { mainnet, RenNetworkDetails } from "@renproject/contracts";
import BigNumber from "bignumber.js";
import Web3 from "web3";

import { WithdrawPopup } from "../../components/popups/WithdrawPopup";
import { alreadyPast } from "../../lib/conversion";
import { _noCapture_ } from "../../lib/errors";
import { DarknodePaymentWeb3 } from "../../lib/ethereum/contracts/bindings/darknodePayment";
import { DarknodeRegistryWeb3 } from "../../lib/ethereum/contracts/bindings/darknodeRegistry";
import { AllTokenDetails, OldToken, Token } from "../../lib/ethereum/tokens";
import { ApplicationState } from "../applicationState";
import { clearPopup, setPopup } from "../popup/popupActions";
import { AppDispatch } from "../rootReducer";
import { waitForTX } from "../statistics/operatorActions";

// export const bridgedToken = (web3: Web3, renNetwork: RenNetworkDetails, address: string): Contract => {
//     return new web3.eth.Contract(renNetwork.WarpGateToken.abi, address);
// };

// export const btcAddressToHex = (address: string) => `0x${decode58(address).toString("hex")}`;
// export const zecAddressToHex = (address: string) => `0x${decode58(address).toString("hex")}`;

// const burn = (
//     web3: Web3,
//     renNetwork: RenNetworkDetails,
//     trader: string,
//     currency: Token,
//     to: string,
// ) => async (dispatch: Dispatch) => {
//     const contract = currency === Token.BTC ? bridgedToken(web3, renNetwork, addressOf[Token.BTC]) :
//         currency === Token.ZEC ? bridgedToken(web3, renNetwork, addressOf[Token.ZEC]) :
//             undefined;

//     if (contract === undefined) {
//         throw new Error("Something went wrong, please reload and try again");
//     }

//     const toHex = currency === Token.BTC ? btcAddressToHex(to) :
//         currency === Token.ZEC ? zecAddressToHex(to) :
//             to;

//     const amount = new BigNumber((await contract.methods.balanceOf(trader).call({ from: trader })).toString());

//     await waitForTX(
//         contract.methods.burn(toHex, amount.toString() /* new BigNumber(amount).multipliedBy(10 ** 8).toFixed() */).send({ from: trader })
//     )(dispatch);
// };

const withdrawOldToken = (
    darknodeID: string,
    token: Token | OldToken,
) => async (dispatch: AppDispatch, getState: () => ApplicationState) => new Promise(async (resolve, reject) => {
    const { web3, renNetwork, address } = getState().trader;

    if (renNetwork.name !== "mainnet") {
        throw new Error(`Withdrawing old tokens not supported on network ${renNetwork.name}`);
    }

    if (!address) {
        throw new Error(`Unable to retrieve account address.`);
    }

    const network = renNetwork as typeof mainnet;

    try {
        const contract = new (web3.eth.Contract)(
            network.addresses.ren.DarknodeRewardVault.abi,
            network.addresses.ren.DarknodeRewardVault.address
        );
        await dispatch(waitForTX(
            contract.methods.withdraw(darknodeID, network.addresses.oldTokens[token].address).send({ from: address }),
            resolve,
        ));
    } catch (error) {
        reject(error);
        return;
    }
});

export const withdrawToken = (
    darknodeID: string,
    token: Token | OldToken,
) => async (dispatch: AppDispatch, getState: () => ApplicationState) => new Promise(async (resolve, reject) => {
    const { renNetwork, web3, address } = getState().trader;

    const tokenDetails = AllTokenDetails.get(token);
    if (tokenDetails === undefined) {
        throw new Error("Unknown token");
    }

    if (!address) {
        throw new Error(`Unable to retrieve account address.`);
    }

    const withdraw = async (_withdrawAddress?: string) => {

        const darknodePayment: DarknodePaymentWeb3 = new (web3.eth.Contract)(
            renNetwork.addresses.ren.DarknodePayment.abi,
            renNetwork.addresses.ren.DarknodePayment.address
        );

        if (!tokenDetails) {
            throw new Error("Unknown token");
        }

        await dispatch(waitForTX(
            darknodePayment.methods.withdraw(darknodeID, renNetwork.addresses.tokens[token]).send({ from: address }),
            resolve,
        ));

        // if (tokenDetails.wrapped) {
        //     if (!withdrawAddress) {
        //         throw new Error("Invalid withdraw address");
        //     }
        //     await burn(web3, renNetwork, trader, token as Token, withdrawAddress)(dispatch);
        // }
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
});

export const withdrawReward = (
    darknodeID: string,
    token: Token | OldToken,
) => async (dispatch: AppDispatch, getState: () => ApplicationState) => {
    const { renNetwork } = getState().trader;

    const tokenDetails = AllTokenDetails.get(token);
    if (tokenDetails === undefined) {
        throw new Error("Unknown token");
    }

    if (tokenDetails.old && renNetwork.name === "mainnet") {
        await withdrawOldToken(darknodeID, token)(dispatch, getState);
    } else {
        await withdrawToken(darknodeID, token)(dispatch, getState);
    }
};

export const approveNode = (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    trader: string,
    bond: BigNumber
) => async (dispatch: AppDispatch) => {
    // tslint:disable-next-line:no-non-null-assertion
    const ercContract = new (web3.eth.Contract)(renNetwork.addresses.erc.ERC20.abi, renNetwork.addresses.tokens.REN.address);
    const ercBalance = new BigNumber(await ercContract.methods.balanceOf(trader).call());
    const ercAllowance = new BigNumber(
        await ercContract.methods.allowance(trader, renNetwork.addresses.ren.DarknodeRegistry.address).call(),
    );

    if (ercAllowance.gte(bond)) {
        // Already approved
        return;
    }

    if (ercBalance.lt(bond)) {
        throw _noCapture_(new Error("You have insufficient REN to register a darknode."));
    }

    return dispatch(waitForTX(
        ercContract.methods.approve(renNetwork.addresses.ren.DarknodeRegistry.address, bond.toFixed()).send({ from: trader })
    ));
};

export const registerNode = (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    trader: string,
    darknodeID: string,
    publicKey: string,
    bond: BigNumber,
    onCancel: () => void,
    onDone: () => void
) => async (dispatch: AppDispatch): Promise<string> => {

    const hardCodedGas = 500000;

    // tslint:disable-next-line:no-non-null-assertion
    const ercContract = new (web3.eth.Contract)(renNetwork.addresses.erc.ERC20.abi, renNetwork.addresses.tokens.REN.address);

    const ercAllowance = new BigNumber(
        await ercContract.methods.allowance(trader, renNetwork.addresses.ren.DarknodeRegistry.address).call()
    );

    let gas: number | undefined = hardCodedGas;
    if (ercAllowance.gte(bond)) {
        gas = undefined;
    }

    let resolved = false;
    const darknodeRegistry: DarknodeRegistryWeb3 = new (web3.eth.Contract)(
        renNetwork.addresses.ren.DarknodeRegistry.abi,
        renNetwork.addresses.ren.DarknodeRegistry.address
    );

    try {
        const res = await dispatch(waitForTX(
            darknodeRegistry.methods.register(darknodeID, publicKey, bond.toFixed()).send({ from: trader, gas }),
            onDone
        ));
        resolved = true;
        return res;
    } catch (error) {
        if (resolved) { onCancel(); }
        throw error;
    }
};

export const deregisterNode = (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    trader: string,
    darknodeID: string,
    onCancel: () => void,
    onDone: () => void
) => async (dispatch: AppDispatch): Promise<string> => {
    // The node has been registered and can be deregistered.

    let resolved = false;
    const darknodeRegistry = new ((web3).eth.Contract)(
        renNetwork.addresses.ren.DarknodeRegistry.abi,
        renNetwork.addresses.ren.DarknodeRegistry.address
    );
    try {
        const res = await dispatch(waitForTX(
            darknodeRegistry.methods.deregister(darknodeID).send({ from: trader }),
            onDone
        ));
        resolved = true;
        return res;
    } catch (error) {
        if (resolved) { onCancel(); }
        throw error;
    }
};

export const refundNode = (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    trader: string,
    darknodeID: string,
    onCancel: () => void,
    onDone: () => void
) => async (dispatch: AppDispatch): Promise<string> => {
    // The node is awaiting refund.

    let resolved = false;
    const darknodeRegistry: DarknodeRegistryWeb3 = new (web3.eth.Contract)(
        renNetwork.addresses.ren.DarknodeRegistry.abi,
        renNetwork.addresses.ren.DarknodeRegistry.address
    );

    try {
        const res = await dispatch(waitForTX(
            darknodeRegistry.methods.refund(darknodeID).send({ from: trader }),
            onDone
        ));
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
) => async (dispatch: AppDispatch): Promise<string> => {
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
        const res = await dispatch(waitForTX(
            call(),
            onDone
        ));
        resolved = true;
        return res;
    } catch (error) {
        if (resolved) { onCancel(); }
        throw error;
    }
};

export const claimForNode = (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    useFixedGasLimit: boolean,
    address: string,
    darknodeID: string,
    onCancel: () => void,
    onDone: () => void
) => async (dispatch: AppDispatch): Promise<string> => {
    // Convert eth to wei

    const darknodePayment: DarknodePaymentWeb3 = new (web3.eth.Contract)(
        renNetwork.addresses.ren.DarknodePayment.abi,
        renNetwork.addresses.ren.DarknodePayment.address
    );

    let resolved = false;

    const call = () => darknodePayment.methods.claim(darknodeID).send({ from: address, gas: useFixedGasLimit ? 200000 : undefined });

    try {
        const res = await dispatch(waitForTX(
            call(),
            onDone
        ));
        resolved = true;
        return res;
    } catch (error) {
        if (resolved) { onCancel(); }
        throw error;
    }
};

export const changeCycle = (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    ignoreError: boolean,
    address: string,
    onCancel: () => void,
    onDone: () => void
) => async (dispatch: AppDispatch): Promise<string> => {
    // Convert eth to wei

    const darknodePayment: DarknodePaymentWeb3 = new (web3.eth.Contract)(
        renNetwork.addresses.ren.DarknodePayment.abi,
        renNetwork.addresses.ren.DarknodePayment.address
    );

    let resolved = false;

    // Try to call `changeCycle` as a read function to see if it reverts
    const cycleTimeoutCall = await darknodePayment.methods.cycleTimeout().call({ from: address });
    if (!cycleTimeoutCall) {
        throw _noCapture_(new Error("Unable to change timeout - please try again"));
    }
    const canCall = new BigNumber(cycleTimeoutCall.toString());
    if (canCall.isEqualTo(0) || !alreadyPast(canCall.toNumber())) {
        return "";
    }

    const call = () => darknodePayment.methods.changeCycle().send({ from: address });

    try {
        const res = await dispatch(waitForTX(
            call(),
            onDone,
        ));
        resolved = true;
        return res;
    } catch (error) {
        if (ignoreError) {
            resolved = true;
            return "";
        }
        if (resolved) { onCancel(); }
        throw error;
    }
};
