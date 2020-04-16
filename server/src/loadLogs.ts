import Web3 from "web3";
import { sha3 } from "web3-utils";

enum EventType {
    Mint = "mint",
    Burn = "burn",
}

interface Event {
    type: EventType;
    price: 0,
};

const events = [];
const logsSyncedBlock = 1;

export const loadLogs = async (web3: Web3) => {
    const shifterAddress = "0x1258d7FF385d1d81017d4a3d464c02f74C61902a";

    const recentRegistrationEvents = await web3.eth.getPastLogs({
        address: shifterAddress,
        fromBlock: logsSyncedBlock,
        toBlock: "latest",
        // topics: [sha3("LogDarknodeRegistered(address,uint256)"), "0x000000000000000000000000" +
        // address.slice(2), null, null] as any,
        topics: [sha3("LogShiftIn(address,uint256,uint256,bytes32)")],
    });

    console.debug(`Found ${recentRegistrationEvents.length} events`);
    console.debug(recentRegistrationEvents[0]);
};
