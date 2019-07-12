export const TODO = "TODO";

// Not currently used

// export const getDarknodeCount = async (web3: Web3, renNetwork: RenNetworkDetails): Promise<BigNumber> => {
//     const darknodeRegistry: DarknodeRegistryWeb3 = new (web3.eth.Contract)(
//         renNetwork.addresses.ren.DarknodeRegistry.abi,
//         renNetwork.addresses.ren.DarknodeRegistry.address
//     );
//     const darknodeCount = await darknodeRegistry.methods.numDarknodes().call();
//     if (darknodeCount === null) {
//         throw _noCapture_(new Error("Unable to retrieve darknode count"));
//     }
//     return new BigNumber(darknodeCount.toString());
// };
