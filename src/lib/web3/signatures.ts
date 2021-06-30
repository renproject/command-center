import { renMainnet } from "@renproject/contracts";
import {
    numberToLeftPaddedBase64String,
    sanitizeBase64String,
    stringTo43APaddedString,
} from "../general/encodingUtils";
import {
    base64Sha256FromTwoBase64Strings,
    base64Sha256FromUtf8String,
} from "../general/sha256";

const encodeNetwork = (network: string) => {
    switch (network) {
        case "mainnet":
            return stringTo43APaddedString("mainnes");
        case "testnet":
            return stringTo43APaddedString("testnes");
        case "localnet":
            return stringTo43APaddedString("localnet");
        case "devnet":
            return stringTo43APaddedString("devneg");
        default:
            return stringTo43APaddedString(network);
    }
};

export const claimFeesDigest = (
    network: string,
    darknodeId: string,
    amount: number,
    to: string,
    nonce: number,
) => {
    const networkHash = encodeNetwork(network);
    const nodeHash = sanitizeBase64String(darknodeId);
    const amountHash = numberToLeftPaddedBase64String(amount.toString());
    const toHash = base64Sha256FromUtf8String(to);
    const nonceHash = numberToLeftPaddedBase64String(nonce.toString());

    const h12 = base64Sha256FromTwoBase64Strings(nodeHash, amountHash);
    const h34 = base64Sha256FromTwoBase64Strings(toHash, nonceHash);
    const h1234 = base64Sha256FromTwoBase64Strings(h12, h34);
    //root
    return base64Sha256FromTwoBase64Strings(networkHash, h1234);
};
