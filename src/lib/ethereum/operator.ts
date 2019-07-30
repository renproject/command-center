import { mainnet, RenNetworkDetails } from "@renproject/contracts";
import BigNumber from "bignumber.js";
import { OrderedSet } from "immutable";
import Web3 from "web3";
import { sha3, toChecksumAddress } from "web3-utils";

import { WaitForTX } from "../../store/statistics/operatorActions";
import { alreadyPast } from "../conversion";
import { _noCapture_ } from "../react/errors";
import { DarknodePaymentWeb3 } from "./contracts/bindings/darknodePayment";
import { DarknodeRegistryWeb3 } from "./contracts/bindings/darknodeRegistry";
import { AllTokenDetails, OldToken, Token } from "./tokens";

const NULL = "0x0000000000000000000000000000000000000000";

const getAllDarknodes = async (web3: Web3, renNetwork: RenNetworkDetails): Promise<string[]> => {
    const batchSize = 10;

    const allDarknodes = [];
    let lastDarknode = NULL;
    const filter = (address: string) => address !== NULL && address !== lastDarknode;
    do {
        const darknodeRegistry: DarknodeRegistryWeb3 = new (web3.eth.Contract)(
            renNetwork.addresses.ren.DarknodeRegistry.abi,
            renNetwork.addresses.ren.DarknodeRegistry.address
        );
        const darknodes = (await darknodeRegistry.methods.getDarknodes(lastDarknode, batchSize.toString()).call());
        if (darknodes === null) {
            throw _noCapture_(new Error("Error calling 'darknodeRegistry.methods.getDarknodes'"));
        }
        allDarknodes.push(...darknodes.filter(filter));
        [lastDarknode] = darknodes.slice(-1);
    } while (lastDarknode !== NULL);

    return allDarknodes;
};

export const getOperatorDarknodes = async (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    address: string,
): Promise<OrderedSet<string>> => {
    // TODO: Should addresses be made lower case or checksum addresses first?

    // Currently, the LogDarknodeRegistered logs don't include the registrar, so
    // instead we loop through every darknode and get it's owner first.
    // NOTE: Retrieving all logs only returns recent logs.

    const darknodes = await getAllDarknodes(web3, renNetwork);

    /*
    Sample log:
    {
        address: "0x75Fa8349fc9C7C640A4e9F1A1496fBB95D2Dc3d5",
        blockHash: "0xfab9c0e4d7ccca3e56d6961fbe17917923898828b3f929093e6b976b8727db39",
        blockNumber: 9740948,
        data: "0x000000000000000000000000945458e071eca54bb534d8ac7c8cd1a3eb318d9200000000000000000000000000000000000000\
        000000152d02c7e14af6800000",
        id: "log_98d2346b",
        logIndex: 2,
        removed: false,
        topics: ["0xd2819ba4c736158371edf0be38fd8d1fc435609832e392f118c4c79160e5bd7b"],
        transactionHash: "0x8ed0e53dffda6c356e25cb1ac3ebe7a69bcab8ebf668a7b2e770480bdb47598b",
        transactionIndex: 2,
        transactionLogIndex: "0x2",
        type: "mined",
    }
    */

    // Get Registration events
    const recentRegistrationEvents = await web3.eth.getPastLogs({
        address: renNetwork.addresses.ren.DarknodeRegistry.address,
        // tslint:disable-next-line:no-any
        fromBlock: renNetwork.addresses.ren.DarknodeRegistry.block || "0x600000" as any,
        toBlock: "latest",
        // topics: [sha3("LogDarknodeRegistered(address,uint256)"), "0x000000000000000000000000" +
        // address.slice(2), null, null] as any,
        // tslint:disable-next-line:no-any
        topics: [sha3("LogDarknodeRegistered(address,uint256)")] as any,
    });
    for (const event of recentRegistrationEvents) {
        // The log data returns back like this:
        // 0x000000000000000000000000945458e071eca54bb534d8ac7c8cd1a3eb318d92000000000000000000000000000000000000000000\
        // 00152d02c7e14af6800000
        // and we want to extract this: 0x945458e071eca54bb534d8ac7c8cd1a3eb318d92 (20 bytes, 40 characters long)
        const darknodeID = toChecksumAddress(`0x${event.data.substr(26, 40)}`);
        darknodes.push(darknodeID);
    }

    // Note: Deregistration events are not included because we are unable to retrieve the operator

    // // Get Deregistration events
    // const recentDeregistrationEvents = await web3.eth.getPastLogs({
    //     address: contracts.DarknodeRegistry.address,
    //     // tslint:disable-next-line:no-any
    //     fromBlock: "0x889E55" as any, // FIXME: Change this based on network or get from address deployment
    //     toBlock: "latest",
    //     // tslint:disable-next-line:no-any
    //     topics: [sha3("LogDarknodeDeregistered(address)"), null] as any,
    // });

    // for (const event of recentDeregistrationEvents) {
    //     const darknodeID = toChecksumAddress("0x" + event.data.substr(26, 40));
    //     darknodes.push(darknodeID);
    // }

    const darknodeRegistry: DarknodeRegistryWeb3 = new (web3.eth.Contract)(
        renNetwork.addresses.ren.DarknodeRegistry.abi,
        renNetwork.addresses.ren.DarknodeRegistry.address
    );
    const operatorPromises = darknodes.map(async (darknodeID: string) =>
        darknodeRegistry.methods.getDarknodeOwner(darknodeID).call()
    );

    let operatorDarknodes = OrderedSet<string>();

    for (let i = 0; i < darknodes.length; i++) {
        if (await operatorPromises[i] === address && !operatorDarknodes.contains(address)) {
            operatorDarknodes = operatorDarknodes.add(darknodes[i]);
        }
    }

    return operatorDarknodes;
};

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
        const contract = new (web3.eth.Contract)(
            network.addresses.ren.DarknodeRewardVault.abi,
            network.addresses.ren.DarknodeRewardVault.address
        );
        await waitForTX(
            contract.methods.withdraw(darknodeID, network.addresses.oldTokens[token].address).send({ from: address }),
            resolve,
        );
    } catch (error) {
        reject(error);
        return;
    }
});

export const approveNode = async (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    address: string,
    bond: BigNumber,
    waitForTX: WaitForTX,
) => {
    // tslint:disable-next-line:no-non-null-assertion
    const ercContract = new (web3.eth.Contract)(renNetwork.addresses.erc.ERC20.abi, renNetwork.addresses.tokens.REN.address);
    const ercBalance = new BigNumber(await ercContract.methods.balanceOf(address).call());
    const ercAllowance = new BigNumber(
        await ercContract.methods.allowance(address, renNetwork.addresses.ren.DarknodeRegistry.address).call(),
    );

    if (ercAllowance.gte(bond)) {
        // Already approved
        return;
    }

    if (ercBalance.lt(bond)) {
        throw _noCapture_(new Error("You have insufficient REN to register a darknode."));
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

    const ercAllowance = new BigNumber(
        await ercContract.methods.allowance(address, renNetwork.addresses.ren.DarknodeRegistry.address).call()
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
        const res = await waitForTX(
            darknodeRegistry.methods.register(darknodeID, publicKey, bond.toFixed()).send({ from: address, gas }),
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
    const darknodeRegistry: DarknodeRegistryWeb3 = new (web3.eth.Contract)(
        renNetwork.addresses.ren.DarknodeRegistry.abi,
        renNetwork.addresses.ren.DarknodeRegistry.address
    );

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

    const darknodePayment: DarknodePaymentWeb3 = new (web3.eth.Contract)(
        renNetwork.addresses.ren.DarknodePayment.abi,
        renNetwork.addresses.ren.DarknodePayment.address
    );

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

export const changeCycle = async (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    ignoreError: boolean,
    address: string,
    onCancel: () => void,
    onDone: () => void,
    waitForTX: WaitForTX,
): Promise<string> => {
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
        const res = await waitForTX(
            call(),
            onDone,
        );
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

// export const bridgedToken = (web3: Web3, renNetwork: RenNetworkDetails, address: string): Contract => {
//     return new web3.eth.Contract(renNetwork.WarpGateToken.abi, address);
// };

// export const btcAddressToHex = (address: string) => `0x${decode58(address).toString("hex")}`;
// export const zecAddressToHex = (address: string) => `0x${decode58(address).toString("hex")}`;

// const burn = (
//     web3: Web3,
//     renNetwork: RenNetworkDetails,
//     address: string,
//     currency: Token,
//     to: string,
//     waitForTX: WaitForTX,
// ) => {
//     const contract = currency === Token.BTC ? bridgedToken(web3, renNetwork, addressOf[Token.BTC]) :
//         currency === Token.ZEC ? bridgedToken(web3, renNetwork, addressOf[Token.ZEC]) :
//             undefined;

//     if (contract === undefined) {
//         throw new Error("Something went wrong, please reload and try again");
//     }

//     const toHex = currency === Token.BTC ? btcAddressToHex(to) :
//         currency === Token.ZEC ? zecAddressToHex(to) :
//             to;

//     const amount = new BigNumber((await contract.methods.balanceOf(address).call({ from: address })).toString());

//     await waitForTX(
//         contract.methods.burn(toHex, amount.toString() /* new BigNumber(amount).multipliedBy(10 ** 8).toFixed() */).send({ from: address })
//     );
// };

export const withdrawToken = (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    address: string | null,
    darknodeID: string,
    token: Token | OldToken,
    waitForTX: WaitForTX,
) => async (_widthrawAddress?: string) => {

    const tokenDetails = AllTokenDetails.get(token);
    if (tokenDetails === undefined) {
        throw new Error("Unknown token");
    }

    if (!address) {
        throw new Error(`Unable to retrieve account address.`);
    }

    const darknodePayment: DarknodePaymentWeb3 = new (web3.eth.Contract)(
        renNetwork.addresses.ren.DarknodePayment.abi,
        renNetwork.addresses.ren.DarknodePayment.address
    );

    if (!tokenDetails) {
        throw new Error("Unknown token");
    }

    await new Promise((resolve) => waitForTX(
        darknodePayment.methods.withdraw(darknodeID, renNetwork.addresses.tokens[token]).send({ from: address }),
        resolve,
    ));

    // if (tokenDetails.wrapped) {
    //     if (!withdrawAddress) {
    //         throw new Error("Invalid withdraw address");
    //     }
    //     await burn(web3, renNetwork, address, token as Token, withdrawAddress)(dispatch);
    // }
};
