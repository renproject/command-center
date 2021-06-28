import { RenNetworkDetails } from "@renproject/contracts";
import BigNumber from "bignumber.js";
import Web3 from "web3";
import { PromiEvent, TransactionConfig } from "web3-core";

import { WaitForTX } from "../../store/networkContainer";
import { createWeb3, Provider } from "../../../jest/globalSetup";
import { darknodeIDBase58ToHex } from "../darknode/darknodeID";
import { getDarknodeRegistry } from "./contract";
import { getOperatorDarknodes } from "./contractReads";
import {
    approveNode,
    deregisterNode,
    refundNode,
    registerNode,
} from "./contractWrites";

let web3: Web3, network: RenNetworkDetails, provider: Provider, address: string;
beforeAll(async () => {
    ({ web3, network, provider, address } = await createWeb3());
});
afterAll(() => {
    provider.engine.stop();
});

const darknodeID = darknodeIDBase58ToHex("8MJpA1rXYMPTeJoYjsFBHJcuYBe7zQ");

const simpleWaitForTX: WaitForTX = async <T extends {}>(
    promiEvent: PromiEvent<T>,
    onConfirmation?: (confirmations?: number) => void,
) =>
    new Promise<string>((resolve, reject) => {
        promiEvent
            .on("transactionHash", (txHash) => {
                resolve(txHash);
                void promiEvent.on("confirmation", (confirmations) => {
                    if (onConfirmation) {
                        onConfirmation(confirmations);
                    }
                });
            })
            .catch(reject);
    });

const callEpoch = async (
    web3Object: Web3,
    renNetwork: RenNetworkDetails,
    fromAddress: string,
    waitForTX: WaitForTX,
    txConfig?: TransactionConfig,
) => {
    const darknodeRegistry = getDarknodeRegistry(web3Object, renNetwork);

    return await waitForTX(
        darknodeRegistry.methods
            .epoch()
            .send({ ...txConfig, from: fromAddress }),
    );
};

test("registering darknode", async () => {
    jest.setTimeout(20000);

    const bond = new BigNumber(100000).times(
        new BigNumber(10).exponentiatedBy(18),
    );

    // (await getDarknodeStatus(web3, network, darknodeID)).should.equal(
    //     RegistrationStatus.Unregistered,
    // );

    // Register
    await approveNode(web3, network, address, bond);

    await registerNode(web3, network, address, darknodeID, bond);

    //
    // (await getDarknodeStatus(web3, network, darknodeID)).should.equal(
    //     RegistrationStatus.RegistrationPending,
    // );

    (await getOperatorDarknodes(web3, network, address))
        .toArray()
        .should.deep.equal([darknodeID]);

    await callEpoch(web3, network, address, simpleWaitForTX);

    // (await getDarknodeStatus(web3, network, darknodeID)).should.equal(
    //     RegistrationStatus.Registered,
    // );

    (await getOperatorDarknodes(web3, network, address))
        .toArray()
        .should.deep.equal([darknodeID]);
});

const triggerBlock = async () => {
    await simpleWaitForTX(
        getDarknodeRegistry(web3, network).methods.minimumBond().send({
            from: address,
        }),
    );
};

test("deregistering darknode", async () => {
    // Deregister
    await deregisterNode(web3, network, address, darknodeID);

    // (await getDarknodeStatus(web3, network, darknodeID)).should.equal(
    //     RegistrationStatus.DeregistrationPending,
    // );

    await callEpoch(web3, network, address, simpleWaitForTX);
    await triggerBlock();
    await callEpoch(web3, network, address, simpleWaitForTX);

    // (await getDarknodeStatus(web3, network, darknodeID)).should.equal(
    //     RegistrationStatus.Refundable,
    // );

    // Refund
    await refundNode(web3, network, address, darknodeID);

    // (await getDarknodeStatus(web3, network, darknodeID)).should.equal(
    //     RegistrationStatus.Unregistered,
    // );
});
