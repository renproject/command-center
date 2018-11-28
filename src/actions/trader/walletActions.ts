import { createStandardAction } from "typesafe-actions";

import { Wallet } from "@Library/wallets/wallet";

interface StoreWalletPayload { wallet: Wallet | null; }
export type StoreWalletAction = (payload: StoreWalletPayload) => void;
export const storeWallet = createStandardAction("STORE_WALLET")<StoreWalletPayload>();
