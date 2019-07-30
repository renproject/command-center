import { ganache } from "@renproject/contracts";
import { should } from "chai";
import { join } from "path";
import Web3 from "web3";

import { darknodeIDBase58ToHex } from "../../components/pages/Darknode";
import { getDarknodeStatus, RegistrationStatus } from "./network";

should();

test("getDarknodeStatus", async () => {
    const web3 = new Web3("http://localhost:8545");
    const networkID = await web3.eth.net.getId();
    const network = ganache(join(process.cwd(), "./node_modules/darknode-sol/build/development/"), networkID);
    const darknodeID = darknodeIDBase58ToHex("8MJpA1rXYMPTeJoYjsFBHJcuYBe7zQ");
    (await getDarknodeStatus(web3, network, darknodeID))
        .should.equal(RegistrationStatus.Unregistered);
});
