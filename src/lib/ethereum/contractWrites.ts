import { mainnet, RenNetworkDetails } from "@renproject/contracts";
import { sleep } from "@renproject/react-components";
import RenSDK from "@renproject/ren";
import { TxStatus } from "@renproject/ren-js-common";
import BigNumber from "bignumber.js";
import Web3 from "web3";
import { TransactionConfig, TransactionReceipt } from "web3-core";
import { sha3, toChecksumAddress } from "web3-utils";

import { retryNTimes } from "../../components/renvmPage/renvmContainer";
import { _catchInteractionException_, _noCapture_ } from "../react/errors";
import { getDarknodePayment, getDarknodeRegistry } from "./contract";
import { AllTokenDetails, OldToken, Token } from "./tokens";
import { WaitForTX } from "./waitForTX";

export const fundNode = async (
    web3: Web3,
    address: string,
    darknodeID: string,
    ethAmountStr: string,
    onCancel: () => void,
    onDone: () => void,
    waitForTX: WaitForTX,
): Promise<string> => {
    // Convert eth to wei
    const ethAmount = new BigNumber(ethAmountStr);
    const weiAmount = ethAmount.times(new BigNumber(10).exponentiatedBy(18)).decimalPlaces(0);
    if (weiAmount.isNaN()) {
        throw new Error(`Invalid ETH amount ${ethAmountStr} - please try again`);
    }

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
        );
        resolved = true;
        return res;
    } catch (error) {
        if (resolved) { onCancel(); }
        throw error;
    }
};

////////////////////////////////
// Darknode Registry contract //
////////////////////////////////

export const callEpoch = async (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    address: string,
    waitForTX: WaitForTX,
    txConfig?: TransactionConfig,
) => {
    const darknodeRegistry = getDarknodeRegistry(web3, renNetwork);

    return await waitForTX(
        darknodeRegistry.methods.epoch().send({ ...txConfig, from: address }),
    );
};

export const approveNode = async (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    address: string,
    bond: BigNumber,
    waitForTX: WaitForTX,
) => {
    // tslint:disable-next-line:no-non-null-assertion
    const ercContract = new (web3.eth.Contract)(renNetwork.addresses.erc.ERC20.abi, renNetwork.addresses.tokens.REN.address);

    // Check that the user has sufficient REN for bond
    let ercBalance;
    try {
        ercBalance = new BigNumber(await retryNTimes(async () => await ercContract.methods.balanceOf(address).call(), 5));
    } catch (error) {
        ercBalance = bond;
        _catchInteractionException_(error, "Error in contractWrites.ts: approveNode > balanceOf");
    }
    if (ercBalance.lt(bond)) {
        throw _noCapture_(new Error("You have insufficient REN to register a darknode."));
    }

    // Check if they've already approved REN
    let ercAllowance;
    try {
        ercAllowance = new BigNumber(
            await retryNTimes(async () => await ercContract.methods.allowance(address, renNetwork.addresses.ren.DarknodeRegistry.address).call(), 5),
        );
    } catch (error) {
        _catchInteractionException_(error, "Error in contractWrites.ts: approveNode > allowance");
        ercAllowance = new BigNumber(0);
    }
    if (ercAllowance.gte(bond)) {
        // Already approved
        return;
    }

    return waitForTX(
        ercContract.methods.approve(renNetwork.addresses.ren.DarknodeRegistry.address, bond.toFixed()).send({ from: address })
    );
};

export const registerNode = async (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    address: string,
    darknodeID: string,
    publicKey: string,
    bond: BigNumber,
    onCancel: () => void,
    onDone: () => void,
    waitForTX: WaitForTX,
): Promise<string> => {
    const hardCodedGas = 500000;

    // tslint:disable-next-line:no-non-null-assertion
    const ercContract = new (web3.eth.Contract)(renNetwork.addresses.erc.ERC20.abi, renNetwork.addresses.tokens.REN.address);

    let ercAllowance;
    try {
        ercAllowance = new BigNumber(
            await retryNTimes(async () => await ercContract.methods.allowance(address, renNetwork.addresses.ren.DarknodeRegistry.address).call(), 5)
        );
    } catch (error) {
        ercAllowance = new BigNumber(0);
        _catchInteractionException_(error, "Error in contractWrites.ts: registerNode > allowance");
    }

    let gas: number | undefined = hardCodedGas;
    if (ercAllowance.gte(bond)) {
        gas = undefined;
    }

    let resolved = false;
    const darknodeRegistry = getDarknodeRegistry(web3, renNetwork);

    try {
        const params = renNetwork.name === mainnet.name ? [darknodeID, publicKey, bond.toFixed()] : [darknodeID, publicKey];
        const res = await waitForTX(
            // @ts-ignore
            darknodeRegistry.methods.register(...params).send({ from: address, gas }),
            onDone
        );
        resolved = true;
        return res;
    } catch (error) {
        if (resolved) { onCancel(); }
        throw error;
    }
};

export const deregisterNode = async (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    address: string,
    darknodeID: string,
    onCancel: () => void,
    onDone: () => void,
    waitForTX: WaitForTX,
): Promise<string> => {
    // The node has been registered and can be deregistered.

    let resolved = false;
    const darknodeRegistry = new ((web3).eth.Contract)(
        renNetwork.addresses.ren.DarknodeRegistry.abi,
        renNetwork.addresses.ren.DarknodeRegistry.address
    );
    try {
        const res = await waitForTX(
            darknodeRegistry.methods.deregister(darknodeID).send({ from: address }),
            onDone
        );
        resolved = true;
        return res;
    } catch (error) {
        if (resolved) { onCancel(); }
        throw error;
    }
};

export const refundNode = async (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    address: string,
    darknodeID: string,
    onCancel: () => void,
    onDone: () => void,
    waitForTX: WaitForTX,
): Promise<string> => {
    // The node is awaiting refund.

    let resolved = false;
    const darknodeRegistry = getDarknodeRegistry(web3, renNetwork);

    try {
        const res = await waitForTX(
            darknodeRegistry.methods.refund(darknodeID).send({ from: address }),
            onDone
        );
        resolved = true;
        return res;
    } catch (error) {
        if (resolved) { onCancel(); }
        throw error;
    }
};

///////////////////////////////
// Darknode Payment contract //
///////////////////////////////

export const claimForNode = async (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    useFixedGasLimit: boolean,
    address: string,
    darknodeID: string,
    onCancel: () => void,
    onDone: () => void,
    waitForTX: WaitForTX,
): Promise<string> => {
    // Convert eth to wei

    const darknodePayment = getDarknodePayment(web3, renNetwork);
    let resolved = false;

    const call = () => darknodePayment.methods.claim(darknodeID).send({ from: address, gas: useFixedGasLimit ? 200000 : undefined });

    try {
        const res = await waitForTX(
            call(),
            onDone
        );
        resolved = true;
        return res;
    } catch (error) {
        if (resolved) { onCancel(); }
        throw error;
    }
};

// export const changeCycle = async (
//     web3: Web3,
//     renNetwork: RenNetworkDetails,
//     ignoreError: boolean,
//     address: string,
//     onCancel: () => void,
//     onDone: () => void,
//     waitForTX: WaitForTX,
// ): Promise<string> => {
//     return "";

//     // // Convert eth to wei

//     // const darknodePayment = getDarknodePayment(web3, renNetwork);

//     // let resolved = false;

//     // // Try to call `changeCycle` as a read function to see if it reverts
//     // const cycleTimeoutCall = await darknodePayment.methods.cycleTimeout().call({ from: address });
//     // if (!cycleTimeoutCall) {
//     //     throw _noCapture_(new Error("Unable to change timeout - please try again"));
//     // }
//     // const canCall = new BigNumber(cycleTimeoutCall.toString());
//     // if (canCall.isEqualTo(0) || !alreadyPast(canCall.toNumber())) {
//     //     return "";
//     // }

//     // const call = () => darknodePayment.methods.changeCycle().send({ from: address });

//     // try {
//     //     const res = await waitForTX(
//     //         call(),
//     //         onDone,
//     //     );
//     //     resolved = true;
//     //     return res;
//     // } catch (error) {
//     //     if (ignoreError) {
//     //         resolved = true;
//     //         return "";
//     //     }
//     //     if (resolved) { onCancel(); }
//     //     throw error;
//     // }
// };

export const withdrawOldToken = async (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    address: string | null,
    darknodeID: string,
    token: Token | OldToken,
    waitForTX: WaitForTX,
) => new Promise(async (resolve, reject) => {

    if (renNetwork.name !== "mainnet") {
        throw new Error(`Withdrawing old tokens not supported on network ${renNetwork.name}`);
    }

    if (!address) {
        throw new Error(`Unable to retrieve account address.`);
    }

    const network = renNetwork as typeof mainnet;

    try {
        const rewardVault = new (web3.eth.Contract)(
            network.addresses.ren.DarknodeRewardVault.abi,
            network.addresses.ren.DarknodeRewardVault.address
        );
        await waitForTX(
            rewardVault.methods.withdraw(darknodeID, network.addresses.oldTokens[token].address).send({ from: address }),
            resolve,
        );
    } catch (error) {
        reject(error);
        return;
    }
});

// export const bridgedToken = (web3: Web3, renNetwork: RenNetworkDetails, address: string): Contract => {
//     return new web3.eth.Contract(renNetwork.WarpGateToken.abi, address);
// };

// export const btcAddressToHex = (address: string) => `0x${decode58(address).toString("hex")}`;
// export const zecAddressToHex = (address: string) => `0x${decode58(address).toString("hex")}`;

const burn = async (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    address: string,
    token: Token,
    amount: BigNumber,
    recipient: string,
    waitForTX: WaitForTX,
    onStatus: (status: TxStatus) => void,
) => {
    const contractDetails = token === Token.BTC ? renNetwork.addresses.shifter.BTCShifter :
        token === Token.ZEC ? renNetwork.addresses.shifter.ZECShifter :
            token === Token.BCH ? renNetwork.addresses.shifter.BCHShifter : undefined;
    if (!contractDetails) {
        throw new Error(`Unable to shift out token ${token}`);
    }
    const contract = new (web3.eth.Contract)(contractDetails.abi, contractDetails._address);

    const sdk = new RenSDK(renNetwork.name);

    const txHash = await waitForTX(contract.methods.shiftOut(
        (sdk.utils[token].addressToHex || RenSDK.Tokens[token].addressToHex)(recipient), // _to
        amount.decimalPlaces(0).toFixed(), // _amount in Satoshis
    ).send({ from: address })
    );

    const shiftOut = await sdk.shiftOut({
        // Send BTC from the Ethereum blockchain to the Bitcoin blockchain.
        // This is the reverse of shitIn.
        sendToken: token === Token.BCH ? RenSDK.Tokens.BCH.Eth2Bch :
            Token.ZEC ? RenSDK.Tokens.ZEC.Eth2Zec :
                RenSDK.Tokens.BTC.Eth2Btc,

        // The web3 provider to talk to Ethereum
        web3Provider: web3.currentProvider,

        // The transaction hash of our contract call
        ethTxHash: txHash,
    }).readFromEthereum();

    const promiEvent = shiftOut.submitToRenVM();
    promiEvent.on("status", onStatus);
    await promiEvent;
};

const TransferEventABI = [
    {
        indexed: true,
        name: "from",
        type: "address"
    }, {
        indexed: true,
        name: "to",
        type: "address"
    }, {
        indexed: false,
        name: "value",
        type: "uint256"
    }
];

export const withdrawToken = (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    address: string | null,
    darknodeID: string,
    token: Token | OldToken,
    waitForTX: WaitForTX,
    onStatus: (status: TxStatus) => void,
) => async (withdrawAddress?: string) => {

    const tokenDetails = AllTokenDetails.get(token);
    if (tokenDetails === undefined) {
        throw new Error("Unknown token");
    }

    if (!address) {
        throw new Error(`Unable to retrieve account address.`);
    }

    const darknodePayment = getDarknodePayment(web3, renNetwork);

    if (!tokenDetails) {
        throw new Error("Unknown token");
    }

    const tx = await waitForTX(darknodePayment.methods.withdraw(darknodeID, renNetwork.addresses.tokens[token].address).send({ from: address }));

    // let recentRegistrationEvents = await web3.eth.getPastLogs({
    //     address: renNetwork.addresses.tokens[token].address,
    //     fromBlock: txHash,
    //     toBlock: txHash,
    //     topics: [,],
    // });

    if (tokenDetails.wrapped) {
        if (!withdrawAddress) {
            throw new Error("Invalid withdraw address");
        }

        let receipt: TransactionReceipt | undefined;

        while (!receipt || !receipt.logs) {
            try {
                receipt = await web3.eth.getTransactionReceipt(tx);
            } catch (error) {
                // Ignore error
            }
            if (!receipt) {
                await sleep(1000);
            }
        }

        let value = new BigNumber(0);
        for (const log of receipt.logs) {
            if (log.topics[0] === sha3("Transfer(address,address,uint256)")) {
                const event = web3.eth.abi.decodeLog(TransferEventABI, log.data, (log.topics as string[]).slice(1));
                if (toChecksumAddress(event.from) === toChecksumAddress(renNetwork.addresses.ren.DarknodePaymentStore.address) && toChecksumAddress(event.to) === toChecksumAddress(address)) {
                    value = value.plus(event.value);
                }
            }
        }

        await burn(web3, renNetwork, address, token as Token, value, withdrawAddress, waitForTX, onStatus);
    }
};
