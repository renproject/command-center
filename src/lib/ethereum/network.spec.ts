import { testnet } from "@renproject/contracts";
import { should } from "chai";

import { darknodeIDBase58ToHex } from "../../components/pages/Darknode";
import { getDarknodeStatus, RegistrationStatus } from "./network";
import { readOnlyWeb3 } from "./wallet";

should();

test("getDarknodeStatus", async () => {
    const web3 = readOnlyWeb3;
    const network = testnet;
    const darknodeID = darknodeIDBase58ToHex("8MJpA1rXYMPTeJoYjsFBHJcuYBe7zQ");
    (await getDarknodeStatus(web3, network, darknodeID))
        .should.equal(RegistrationStatus.Registered);
});
