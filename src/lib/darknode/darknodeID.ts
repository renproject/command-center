import { toChecksumAddress } from "web3-utils";
import { Ox } from "../ethereum/contractReads";

import { EncodedData, Encodings } from "../general/encodedData";

export const darknodeIDBase58ToHex = (darknodeID: string): string =>
    toChecksumAddress(
        Ox(
            new EncodedData(darknodeID, Encodings.BASE58).toHex("").slice(4),
        ).toLowerCase(),
    );

export const darknodeIDHexToBase58 = (darknodeID: string): string =>
    new EncodedData(`0x1B14${darknodeID.slice(2)}`, Encodings.HEX).toBase58();

export const darknodeIDBase58ToPaddedBase64 = (darknodeID: string) => {
    const longAddress = darknodeIDBase58ToHex(darknodeID);
    const address = `0x${longAddress.slice(6)}`;
    console.log(address);
    return new EncodedData(address, Encodings.HEX).toBase64().toString();
};
