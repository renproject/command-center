import { toChecksumAddress } from "web3-utils";
import { Ox } from "../ethereum/contractReads";

import { EncodedData, Encodings } from "../general/encodedData";

export const darknodeIDBase58ToHex = (darknodeIDBase: string): string =>
    toChecksumAddress(
        Ox(
            new EncodedData(darknodeIDBase, Encodings.BASE58)
                .toHex("")
                .slice(4),
        ).toLowerCase(),
    );

export const darknodeIDHexToBase58 = (darknodeIDHex: string): string =>
    new EncodedData(
        `0x1B14${darknodeIDHex.slice(2)}`,
        Encodings.HEX,
    ).toBase58();

export const darknodeIDBase58ToRenVmID = (darknodeID: string) => {
    const decoded = new EncodedData(darknodeID, Encodings.BASE58).toBuffer();
    const address = decoded.slice(2);
    const bytes32 = Buffer.alloc(32, 0);
    address.copy(bytes32);
    return bytes32
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/\=+$/, "");
};

export const renVMIDToBase58 = (renVMID: string) => {
    const bytes32 = new EncodedData(renVMID, Encodings.BASE64).toBuffer();
    const bytes24 = bytes32.slice(0, 20);
    const address = new EncodedData(bytes24, Encodings.BUFFER).toHex();
    return darknodeIDHexToBase58(address);
};

(window as any).renVMID2Base58 = renVMIDToBase58;
(window as any).darknodeIDBase58ToRenVmID = darknodeIDBase58ToRenVmID;
