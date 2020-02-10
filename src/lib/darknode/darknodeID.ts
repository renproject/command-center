import { toChecksumAddress } from "web3-utils";

import { EncodedData, Encodings } from "../../lib/general/encodedData";

export const darknodeIDBase58ToHex = (darknodeID: string): string =>
    toChecksumAddress(
        (`0x${new EncodedData(darknodeID, Encodings.BASE58).toHex("").slice(4)}`).toLowerCase()
    );

export const darknodeIDHexToBase58 = (darknodeID: string): string =>
    new EncodedData(`0x1B14${darknodeID.slice(2)}`, Encodings.HEX).toBase58();
