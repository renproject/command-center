import { getReadOnlyProvider, WalletDetail } from "@Library/wallets/wallet";

export const PrivateKey: WalletDetail = {
    name: "Private Key",
    slug: "key",
    description: "Sign in using your private key or mnemonic",
    enabled: false,
    getWeb3Provider: () => [getReadOnlyProvider(), null],
};
