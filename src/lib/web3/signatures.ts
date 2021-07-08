import BigNumber from "bignumber.js";
import { sha256 } from "ethereumjs-util";
import {
    numberToLeftPaddedBase64String,
    sanitizeBase64String,
} from "../general/encodingUtils";
import {
    base64Sha256FromTwoBase64Strings,
    base64Sha256FromUtf8String,
} from "../general/sha256";
import { marshalString, marshalTypedPackValue } from "../pack/marshal";
import { TypedPackValue } from "../pack/pack";

export const claimFeesDigest = (
    asset: string,
    network: string,
    node: string,
    amount: BigNumber,
    to: string,
    nonce: number,
) => {
    console.debug("signing", { asset, network, node, amount, to, nonce });
    const assetHash = base64Sha256FromUtf8String(asset);
    const networkHash = base64Sha256FromUtf8String(network);
    const nodeHash = sanitizeBase64String(node);
    const amountHash = numberToLeftPaddedBase64String(amount.toFixed());
    const toHash = base64Sha256FromUtf8String(to);
    const nonceHash = numberToLeftPaddedBase64String(nonce.toString());

    console.debug("signing merkle data", {
        assetHash,
        networkHash,
        nodeHash,
        amountHash,
        toHash,
        nonceHash,
    });
    const h01 = base64Sha256FromTwoBase64Strings(assetHash, networkHash);
    const h23 = base64Sha256FromTwoBase64Strings(nodeHash, amountHash);
    const h45 = base64Sha256FromTwoBase64Strings(toHash, nonceHash);
    const h2345 = base64Sha256FromTwoBase64Strings(h23, h45); // good one
    //root
    console.debug(h01, h2345);
    return base64Sha256FromTwoBase64Strings(h01, h2345);
};

export const hashTransaction = (
    version: string,
    selector: string,
    packValue: TypedPackValue,
) => {
    return sha256(
        Buffer.concat([
            marshalString(version),
            marshalString(selector),
            marshalTypedPackValue(packValue),
        ]),
    );
};
