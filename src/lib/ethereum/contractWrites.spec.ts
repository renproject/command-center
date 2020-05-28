import { RenNetworkDetails } from "@renproject/contracts";
import Web3 from "web3";
import { PromiEvent } from "web3-core";

import { WaitForTX } from "../../store/networkStateContainer";
import { createWeb3, Provider } from "../../test/globalSetup";
import { darknodeIDBase58ToHex } from "../darknode/darknodeID";
import { getDarknodeRegistry } from "./contract";
import {
    getDarknodeStatus, getMinimumBond, getOperatorDarknodes, RegistrationStatus,
} from "./contractReads";
import { approveNode, callEpoch, deregisterNode, refundNode, registerNode } from "./contractWrites";

let web3: Web3, network: RenNetworkDetails, provider: Provider, address: string;
beforeAll(async () => { ({ web3, network, provider, address } = await createWeb3()); });
afterAll(() => { provider.engine.stop(); });

const darknodeID = darknodeIDBase58ToHex("8MJpA1rXYMPTeJoYjsFBHJcuYBe7zQ");

const simpleWaitForTX: WaitForTX = async <T extends {}>(promiEvent: PromiEvent<T>, onConfirmation?: (confirmations?: number) => void) => new Promise<string>((resolve, reject) => {
    promiEvent.on("transactionHash", (txHash) => {
        resolve(txHash);
        promiEvent.on("confirmation", (confirmations) => {
            if (onConfirmation) { onConfirmation(confirmations); }
        });
    }).catch(reject);
});

test("registering darknode", async () => {
    jest.setTimeout(20000);

    const bond = await getMinimumBond(web3, network);

    (await getDarknodeStatus(web3, network, darknodeID))
        .should.equal(RegistrationStatus.Unregistered);

    // Register
    await approveNode(web3, network, address, bond, simpleWaitForTX);

    await new Promise((resolve) => registerNode(web3, network, address, darknodeID, "0x00", bond, () => null, resolve, simpleWaitForTX));

    (await getDarknodeStatus(web3, network, darknodeID))
        .should.equal(RegistrationStatus.RegistrationPending);

    (await getOperatorDarknodes(web3, network, address)).toArray()
        .should.deep.equal([darknodeID]);

    await callEpoch(web3, network, address, simpleWaitForTX);

    (await getDarknodeStatus(web3, network, darknodeID))
        .should.equal(RegistrationStatus.Registered);

    (await getOperatorDarknodes(web3, network, address)).toArray()
        .should.deep.equal([darknodeID]);

});

const triggerBlock = async () => {
    // tslint:disable-next-line: await-promise
    await simpleWaitForTX(
        // tslint:disable-next-line: no-any
        (getDarknodeRegistry(web3, network).methods.minimumBond() as any)
            .send({ from: address })
    );
};

test("deregistering darknode", async () => {
    // Deregister
    await new Promise((resolve) => deregisterNode(web3, network, address, darknodeID, () => null, resolve, simpleWaitForTX));

    (await getDarknodeStatus(web3, network, darknodeID))
        .should.equal(RegistrationStatus.DeregistrationPending);

    await callEpoch(web3, network, address, simpleWaitForTX);
    await triggerBlock();
    await callEpoch(web3, network, address, simpleWaitForTX);

    (await getDarknodeStatus(web3, network, darknodeID))
        .should.equal(RegistrationStatus.Refundable);

    // Refund
    await new Promise((resolve) => refundNode(web3, network, address, darknodeID, () => null, resolve, simpleWaitForTX));

    (await getDarknodeStatus(web3, network, darknodeID))
        .should.equal(RegistrationStatus.Unregistered);
});
