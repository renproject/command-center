import { getReadOnlyProvider, WalletDetail } from "@Library/wallets/wallet";

export const PrivateKey: WalletDetail = {
    name: "Private Key",
    slug: "key",
    description: "",
    enabled: false,
    getWeb3Provider: () => [getReadOnlyProvider(), null],
};
