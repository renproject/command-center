import { RenNetworkDetails } from "@renproject/contracts";
import BigNumber from "bignumber.js";
import Web3 from "web3";

import { retryNTimes } from "../../controllers/statsPages/renvmStatsPage/renvmContainer";
import { WaitForTX } from "../../store/networkContainer";
import { catchInteractionException, noCapture } from "../react/errors";
import {
    getDarknodePayment,
    getDarknodeRegistry,
    getRenToken,
} from "./contract";
import { TokenString } from "./tokens";

/**
 * Top-up the ETH balance of a darknode.
 *
 * @param web3 Web3 provider with `address` unlocked.
 * @param address Ethereum address to send ETH from.
 * @param darknodeID Hexadecimal ID of the darknode to fund.
 * @param ethAmountStr Amount as a string.
 * @param onCancel Callback if the user cancels or an error is thrown.
 * @param onDone Callback after the transaction's txHash is available.
 * @param waitForTX Returns the txHash of a PromiEvent.
 */
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
    const weiAmount = ethAmount
        .times(new BigNumber(10).exponentiatedBy(18))
        .decimalPlaces(0);
    if (weiAmount.isNaN()) {
        throw new Error(
            `Invalid ETH amount ${ethAmountStr} - please try again`,
        );
    }

    // Simple ETH transaction with no data.
    const call = () =>
        web3.eth.sendTransaction({
            to: darknodeID,
            value: weiAmount.toFixed(),
            from: address,
        });

    let resolved = false;
    try {
        const res = await waitForTX(call(), onDone);
        resolved = true;
        return res;
    } catch (error) {
        if (resolved) {
            onCancel();
        }
        throw error;
    }
};

////////////////////////////////
// Darknode Registry contract //
////////////////////////////////

/**
 * Approve REN to the DarknodeRegistry contract for registering a node.
 *
 * @param web3 Web3 provider with `address` unlocked.
 * @param renNetwork The details of the selected Ren network.
 * @param address Ethereum address to send Ethereum transactions from.
 * @param bond The bond amount in REN's smallest unit (1e-18 REN).
 * @param waitForTX Returns the txHash of a PromiEvent.
 */
export const approveNode = async (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    address: string,
    bond: BigNumber,
    waitForTX: WaitForTX,
) => {
    const ercContract = getRenToken(web3, renNetwork);

    // Check that the user has sufficient REN for bond
    let ercBalance;
    try {
        ercBalance = new BigNumber(
            await retryNTimes(
                async () => await ercContract.methods.balanceOf(address).call(),
                2,
            ),
        );
    } catch (error) {
        ercBalance = bond;
        catchInteractionException(
            error,
            "Error in contractWrites.ts: approveNode > balanceOf",
        );
    }
    if (ercBalance.lt(bond)) {
        throw noCapture(
            new Error("You have insufficient REN to register a darknode."),
        );
    }

    // Check if they've already approved REN
    let ercAllowance;
    try {
        ercAllowance = new BigNumber(
            await retryNTimes(
                async () =>
                    await ercContract.methods
                        .allowance(
                            address,
                            renNetwork.addresses.ren.DarknodeRegistry.address,
                        )
                        .call(),
                2,
            ),
        );
    } catch (error) {
        catchInteractionException(
            error,
            "Error in contractWrites.ts: approveNode > allowance",
        );
        ercAllowance = new BigNumber(0);
    }
    if (ercAllowance.gte(bond)) {
        // Already approved
        return;
    }

    return waitForTX(
        ercContract.methods
            .approve(
                renNetwork.addresses.ren.DarknodeRegistry.address,
                bond.toFixed(),
            )
            .send({ from: address }),
    );
};

/**
 * Register node in the DarknodeRegistry contract. Must have called
 * [[approveNode]] first. The darknode will then have the status
 * "Registration Pending" until the next Epoch.
 *
 * @param web3 Web3 provider with `address` unlocked.
 * @param darknodeID Hexadecimal ID of the darknode to register.
 * @param publicKey Hexadecimal public key of the darknode.
 * @param bond The bond amount in REN's smallest unit (1e-18 REN).
 * @param onCancel Callback if the user cancels or an error is thrown.
 * @param onDone Callback after the transaction's txHash is available.
 * @param waitForTX Returns the txHash of a PromiEvent.
 */
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

    const ercContract = getRenToken(web3, renNetwork);

    let ercAllowance;
    try {
        ercAllowance = new BigNumber(
            await retryNTimes(
                async () =>
                    await ercContract.methods
                        .allowance(
                            address,
                            renNetwork.addresses.ren.DarknodeRegistry.address,
                        )
                        .call(),
                2,
            ),
        );
    } catch (error) {
        ercAllowance = new BigNumber(0);
        catchInteractionException(
            error,
            "Error in contractWrites.ts: registerNode > allowance",
        );
    }

    let gas: number | undefined = hardCodedGas;
    if (ercAllowance.gte(bond)) {
        gas = undefined;
    }

    let resolved = false;
    const darknodeRegistry = getDarknodeRegistry(web3, renNetwork);

    try {
        const res = await waitForTX(
            darknodeRegistry.methods
                .register(darknodeID, publicKey)
                .send({ from: address, gas }),
            onDone,
        );
        resolved = true;
        return res;
    } catch (error) {
        if (resolved) {
            onCancel();
        }
        throw error;
    }
};

/**
 * Deregister a node in the DarknodeRegistry contract. The node will then have
 * the status "Pending Deregistration" until the next Epoch. The bond won't
 * be returned yet.
 *
 * @param renNetwork The details of the selected Ren network.
 * @param darknodeID Hexadecimal ID of the darknode to deregister.
 * @param onCancel Callback if the user cancels or an error is thrown.
 * @param onDone Callback after the transaction's txHash is available.
 * @param waitForTX Returns the txHash of a PromiEvent.
 */
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
    const darknodeRegistry = new web3.eth.Contract(
        renNetwork.addresses.ren.DarknodeRegistry.abi,
        renNetwork.addresses.ren.DarknodeRegistry.address,
    );
    try {
        const res = await waitForTX(
            darknodeRegistry.methods
                .deregister(darknodeID)
                .send({ from: address }),
            onDone,
        );
        resolved = true;
        return res;
    } catch (error) {
        if (resolved) {
            onCancel();
        }
        throw error;
    }
};

/**
 * Return the REN bond of the darknode. This is the last step in deregistering
 * a darknode.
 *
 * @param address Ethereum address to send Ethereum transactions from.
 * @param darknodeID Hexadecimal ID of the darknode to refund.
 * @param onCancel Callback if the user cancels or an error is thrown.
 * @param onDone Callback after the transaction's txHash is available.
 * @param waitForTX Returns the txHash of a PromiEvent.
 */
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
            onDone,
        );
        resolved = true;
        return res;
    } catch (error) {
        if (resolved) {
            onCancel();
        }
        throw error;
    }
};

/**
 * Withdraw a darknode's fees for a single token from the DarknodePayment
 * contract.
 *
 * @param web3 Web3 provider with `address` unlocked.
 * @param darknodeID Hexadecimal ID of the darknode to register.
 * @param address Ethereum address to send Ethereum transactions from.
 * @param darknodeID Hexadecimal ID of the darknode to refund.
 * @param token The token to withdraw fees for.
 * @param waitForTX Returns the txHash of a PromiEvent.
 */
export const withdrawToken = (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    address: string | null,
    darknodeID: string,
    token: TokenString,
    waitForTX: WaitForTX,
) => async () => {
    if (!address) {
        throw new Error(`Unable to retrieve account address.`);
    }

    const darknodePayment = getDarknodePayment(web3, renNetwork);

    const txPromiEvent = darknodePayment.methods
        .withdraw(
            darknodeID,
            (
                renNetwork.addresses.tokens[token] ||
                renNetwork.addresses.tokens[
                    token
                        .replace(/^ren/, "")
                        .replace(/^test/, "")
                        .replace(/^dev/, "")
                ]
            ).address,
        )
        .send({ from: address });

    await waitForTX(txPromiEvent);

    await new Promise((resolve, reject) => {
        txPromiEvent.on("confirmation", resolve).catch(reject);
    });
};
