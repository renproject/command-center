import { getReadOnlyProvider, WalletDetail } from "@Library/wallets/wallet";

// Unimplemented
export const Trezor: WalletDetail = {
    name: "Trezor",
    slug: "trezor",
    description: "Sign using your Trezor hardware wallet",
    enabled: false,
    getWeb3Provider: () => [getReadOnlyProvider(), null],
};
