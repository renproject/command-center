import { RenNetworkDetails } from "@renproject/contracts";
import Web3 from "web3";

import { createWeb3, Provider } from "../../../test/globalSetup";
import { darknodeIDBase58ToHex } from "../../components/pages/Darknode";
import { getDarknodeStatus, getMinimumBond, RegistrationStatus } from "./contractReads";
import { approveNode, registerNode } from "./contractWrites";
import { simpleWaitForTX } from "./waitForTX";

let web3: Web3, network: RenNetworkDetails, provider: Provider, address: string;
beforeAll(async () => { ({ web3, network, provider, address } = await createWeb3()); });
afterAll(() => { provider.engine.stop(); });

test("registering a node", async () => {
    const bond = await getMinimumBond(web3, network);
    const darknodeID = darknodeIDBase58ToHex("8MJpA1rXYMPTeJoYjsFBHJcuYBe7zQ");

    (await getDarknodeStatus(web3, network, darknodeID))
        .should.equal(RegistrationStatus.Unregistered);

    await approveNode(web3, network, address, bond, simpleWaitForTX);

    await new Promise((resolve) => registerNode(web3, network, address, darknodeID, "0x00", bond, () => null, resolve, simpleWaitForTX));

    (await getDarknodeStatus(web3, network, darknodeID))
        .should.equal(RegistrationStatus.RegistrationPending);
});
