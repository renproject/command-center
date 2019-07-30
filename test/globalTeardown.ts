import { Provider, resetEVM } from "./globalSetup";

// This is run by Jest once after running all tests. Globals are set in the
// global setup. (`globalTeardown` is configured in `package.json`).
const globalTeardown = async () => {
    await resetEVM((global as any).web3, (global as any).snapshotID);
    ((global as any).provider as Provider).engine.stop();
};

export default globalTeardown;
