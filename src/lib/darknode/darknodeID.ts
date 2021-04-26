import { toChecksumAddress } from "web3-utils";

import { EncodedData, Encodings } from "../../lib/general/encodedData";
import { Ox } from "../ethereum/contractReads";

export const darknodeIDBase58ToHex = (darknodeID: string): string =>
    toChecksumAddress(
        Ox(
            new EncodedData(darknodeID, Encodings.BASE58).toHex("").slice(4),
        ).toLowerCase(),
    );

export const darknodeIDHexToBase58 = (darknodeID: string): string =>
    new EncodedData(`0x1B14${darknodeID.slice(2)}`, Encodings.HEX).toBase58();
