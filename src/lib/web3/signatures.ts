import { sha256 } from "ethereumjs-util";

export const claimFeesDigest = (
    darknodeId: string,
    amount: number,
    address: string,
    nonce: number,
) => {
    const hash = (x: any) => x.toString(); // sha256;
    const nodeHash = hash(stringToBuffer(darknodeId));
    const amountHash = hash(toBytes32(stringToBuffer(amount.toString())));
    const toHash = hash(sha256(stringToBuffer(address)));
    const nonceHash = hash(toBytes32(stringToBuffer(nonce.toString())));

    console.log(nodeHash, amountHash, toHash, nonceHash);
    const h01 = hash(nodeHash + amountHash);
    const h23 = hash(toHash + nonceHash);
    return hash(h01 + h23);
};

(window as any).Buffer = Buffer;

export const toBytes32 = (value: Buffer) => {
    const bytes32 = Buffer.alloc(32, 0);
    value.copy(bytes32);
    return bytes32;
};

export const prependBytes32 = (value: number) => {
    const bytes32 = Buffer.alloc(32, 0);
    const strBuff = stringToBuffer(value.toString());
    strBuff.copy(bytes32);
    return bytes32;
};

const stringToBuffer = (str: string) => {
    const buffer = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    const bufferView = new Uint16Array(buffer);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufferView[i] = str.charCodeAt(i);
    }
    return new Buffer(buffer);
};
