import { WalletDetail } from "@Library/wallets/wallet";

import FakeProvider from "web3-fake-provider";

export const MockAccount = "0x47D33b27Bb249a2DBab4C0612BF9CaF4C1950855";
export const MockBalance = 0;
export const MockSignature =
    "0x30755ed65396facf86c53e6217c52b4daebe72aa4941d89635409de4c9c7f9466d4e9aaec7977f05e923889b33c0d0dd27d7226b6e6f56ce737465c5cfd04be400";
export const MockSignature64 = "MHVe1lOW+s+GxT5iF8UrTa6+cqpJQdiWNUCd5MnH+UZtTpqux5d/BekjiJszwNDdJ9cia25vVs5zdGXFz9BL5AA=";

export const MockWallet: WalletDetail = {
    name: "MockWallet",
    slug: "mock",
    description: "Mock wallet for testing purposes",
    enabled: true,
    getWeb3Provider: async () => new FakeProvider(),
};
