import Web3 from "web3";

import { loadLogs } from "./loadLogs";

// tslint:disable-next-line: no-console

// import { Database } from "./loadDB";
// import { startServer } from "./server";

const main = async () => {
    // Load database (takes ~10 seconds)
    // const db = new Database();
    // await db.load();

    // await startServer(db);

    const web3 = new Web3("https://mainnet.infura.io/v3/fa7d507418f54bbfb78a054eabb01f48");
    await loadLogs(web3);
};

main().catch(console.error);
