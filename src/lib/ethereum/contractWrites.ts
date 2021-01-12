import { RenNetworkDetails } from "@renproject/contracts";
import BigNumber from "bignumber.js";
import Web3 from "web3";
import { PromiEvent, TransactionReceipt } from "web3-core";

import { retryNTimes } from "../../controllers/pages/renvmStatsPage/renvmContainer";
import { catchInteractionException, noCapture } from "../react/errors";
import {
    getDarknodePayment,
    getDarknodeRegistry,
    getRenToken,
} from "./contract";

/**
 * Top-up the ETH balance of a darknode.
 *
 * @param web3 Web3 provider with `address` unlocked.
 * @param address Ethereum address to send ETH from.
 * @param darknodeID Hexadecimal ID of the darknode to fund.
 * @param ethAmountStr Amount as a string.
 */
export const fundNode = (
    web3: Web3,
    address: string,
    darknodeID: string,
    ethAmountStr: string,
): PromiEvent<TransactionReceipt> => {
    // Convert eth to wei
    const weiAmount = new BigNumber(ethAmountStr)
        .times(new BigNumber(10).exponentiatedBy(18))
        .decimalPlaces(0);
    if (weiAmount.isNaN()) {
        throw new Error(
            `Invalid ETH amount '${ethAmountStr}' - please try again`,
        );
    }

    // Simple ETH transaction with no data.
    return web3.eth.sendTransaction({
        to: darknodeID,
        value: weiAmount.toFixed(),
        from: address,
    });
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
 */
export const approveNode = async (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    address: string,
    bond: BigNumber,
): Promise<{ promiEvent: PromiEvent<TransactionReceipt> | null }> => {
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
        return { promiEvent: null };
    }

    return {
        promiEvent: ercContract.methods
            .approve(
                renNetwork.addresses.ren.DarknodeRegistry.address,
                bond.toFixed(),
            )
            .send({ from: address }),
    };
};

/**
 * Register node in the DarknodeRegistry contract. Must have called
 * [[approveNode]] first. The darknode will then have the status
 * "Registration Pending" until the next Epoch.
 *
 * @param web3 Web3 provider with `address` unlocked.
 * @param renNetwork The details of the selected Ren network.
 * @param darknodeID Hexadecimal ID of the darknode to register.
 * @param bond The bond amount in REN's smallest unit (1e-18 REN).
 */
export const registerNode = async (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    address: string,
    darknodeID: string,
    bond: BigNumber,
): Promise<{ promiEvent: PromiEvent<TransactionReceipt> }> => {
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

    const darknodeRegistry = getDarknodeRegistry(web3, renNetwork);

    return {
        promiEvent: darknodeRegistry.methods
            .register(darknodeID, [])
            .send({ from: address, gas }),
    };
};

/**
 * Deregister a node in the DarknodeRegistry contract. The node will then have
 * the status "Pending Deregistration" until the next Epoch. The bond won't
 * be returned yet.
 *
 * @param web3 Web3 provider with `address` unlocked.
 * @param renNetwork The details of the selected Ren network.
 * @param address Ethereum address to send Ethereum transactions from.
 * @param darknodeID Hexadecimal ID of the darknode to deregister.
 */
export const deregisterNode = (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    address: string,
    darknodeID: string,
): PromiEvent<TransactionReceipt> => {
    // The node has been registered and can be deregistered.

    const darknodeRegistry = new web3.eth.Contract(
        renNetwork.addresses.ren.DarknodeRegistry.abi,
        renNetwork.addresses.ren.DarknodeRegistry.address,
    );
    return darknodeRegistry.methods
        .deregister(darknodeID)
        .send({ from: address });
};

/**
 * Return the REN bond of the darknode. This is the last step in deregistering
 * a darknode.
 *
 * @param web3 Web3 provider with `address` unlocked.
 * @param renNetwork The details of the selected Ren network.
 * @param address Ethereum address to send Ethereum transactions from.
 * @param darknodeID Hexadecimal ID of the darknode to refund.
 */
export const refundNode = (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    address: string,
    darknodeID: string,
): PromiEvent<TransactionReceipt> => {
    // The node is awaiting refund.

    const darknodeRegistry = getDarknodeRegistry(web3, renNetwork);

    return darknodeRegistry.methods.refund(darknodeID).send({ from: address });
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
 */
export const withdrawToken = (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    address: string | null,
    darknodeIDs: string[],
    tokenAddress: string,
): PromiEvent<TransactionReceipt> => {
    if (!address) {
        throw new Error(`Unable to retrieve account address.`);
    }

    const darknodePayment = getDarknodePayment(web3, renNetwork);

    if (darknodeIDs.length === 1) {
        return darknodePayment.methods
            .withdraw(darknodeIDs[0], tokenAddress)
            .send({ from: address });
    } else {
        return darknodePayment.methods
            .withdrawMultiple(darknodeIDs, [tokenAddress])
            .send({ from: address });
    }
};
