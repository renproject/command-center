import { RenNetworkDetails } from "@renproject/contracts";
import Web3 from "web3";

import { DarknodePayment } from "./contracts/bindings/DarknodePayment";
import { DarknodePaymentStore } from "./contracts/bindings/DarknodePaymentStore";
import { DarknodeRegistry } from "./contracts/bindings/DarknodeRegistry";

export const getDarknodeRegistry = (web3: Web3, renNetwork: RenNetworkDetails): DarknodeRegistry => new (web3.eth.Contract)(
    renNetwork.addresses.ren.DarknodeRegistry.abi,
    renNetwork.addresses.ren.DarknodeRegistry.address
);

export const getDarknodePayment = (web3: Web3, renNetwork: RenNetworkDetails): DarknodePayment => new (web3.eth.Contract)(
    renNetwork.addresses.ren.DarknodePayment.abi,
    renNetwork.addresses.ren.DarknodePayment.address
);

export const getDarknodePaymentStore = (web3: Web3, renNetwork: RenNetworkDetails): DarknodePaymentStore => new (web3.eth.Contract)(
    renNetwork.addresses.ren.DarknodePaymentStore.abi,
    renNetwork.addresses.ren.DarknodePaymentStore.address
);
