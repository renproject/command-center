import { renMainnet } from "@renproject/contracts";
import {
    numberToLeftPaddedBase64String,
    sanitizeBase64String,
} from "../general/encodingUtils";
import {
    base64Sha256FromTwoBase64Strings,
    base64Sha256FromUtf8String,
} from "../general/sha256";

export const claimFeesDigest = (
    network: string,
    darknodeId: string,
    amount: number,
    to: string,
    nonce: number,
) => {
    const networkHash = sanitizeBase64String(network);
    const nodeHash = sanitizeBase64String(darknodeId);
    const amountHash = numberToLeftPaddedBase64String(amount.toString());
    const toHash = base64Sha256FromUtf8String(to);
    const nonceHash = numberToLeftPaddedBase64String(nonce.toString());

    console.info(nodeHash, amountHash, toHash, nonceHash);
    const h12 = base64Sha256FromTwoBase64Strings(nodeHash, amountHash);
    const h34 = base64Sha256FromTwoBase64Strings(toHash, nonceHash);
    const h1234 = base64Sha256FromTwoBase64Strings(h12, h34);
    //root
    return base64Sha256FromTwoBase64Strings(networkHash, h1234);
};
