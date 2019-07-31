import { RenNetworkDetails } from "@renproject/contracts";
import Web3 from "web3";

import { DarknodePaymentWeb3 } from "./contracts/bindings/darknodePayment";
import { DarknodePaymentStoreWeb3 } from "./contracts/bindings/darknodePaymentStore";
import { DarknodeRegistryWeb3 } from "./contracts/bindings/darknodeRegistry";

export const getDarknodeRegistry = (web3: Web3, renNetwork: RenNetworkDetails): DarknodeRegistryWeb3 => new (web3.eth.Contract)(
    renNetwork.addresses.ren.DarknodeRegistry.abi,
    renNetwork.addresses.ren.DarknodeRegistry.address
);

export const getDarknodePayment = (web3: Web3, renNetwork: RenNetworkDetails): DarknodePaymentWeb3 => new (web3.eth.Contract)(
    renNetwork.addresses.ren.DarknodePayment.abi,
    renNetwork.addresses.ren.DarknodePayment.address
);

export const getDarknodePaymentStore = (web3: Web3, renNetwork: RenNetworkDetails): DarknodePaymentStoreWeb3 => new (web3.eth.Contract)(
    renNetwork.addresses.ren.DarknodePaymentStore.abi,
    renNetwork.addresses.ren.DarknodePaymentStore.address
);
