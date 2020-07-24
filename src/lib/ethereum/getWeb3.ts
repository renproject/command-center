import Web3 from "web3";

export const ErrorCanceledByUser = "User denied transaction signature.";

export const getReadOnlyWeb3 = (publicNode: string): Web3 => {
    return new Web3(publicNode);
};
