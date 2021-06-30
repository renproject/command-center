import {
    numberToLeftPaddedBase64String,
    sanitizeBase64String,
} from "../general/encodingUtils";
import {
    base64Sha256FromTwoBase64Strings,
    base64Sha256FromUtf8String,
} from "../general/sha256";

export const claimFeesDigest = (
    darknodeId: string,
    amount: number,
    address: string,
    nonce: number,
) => {
    const nodeHash = sanitizeBase64String(darknodeId);
    const amountHash = numberToLeftPaddedBase64String(amount.toString());
    const toHash = base64Sha256FromUtf8String(address);
    const nonceHash = numberToLeftPaddedBase64String(nonce.toString());

    console.info(nodeHash, amountHash, toHash, nonceHash);
    const h01 = base64Sha256FromTwoBase64Strings(nodeHash, amountHash);
    const h23 = base64Sha256FromTwoBase64Strings(toHash, nonceHash);

    //root
    return base64Sha256FromTwoBase64Strings(h01, h23);
};
