import { base64StringToHexString } from "../general/encodingUtils";
import { claimFeesDigest } from "./signatures";

describe("signatures", () => {
    test("creates signature", () => {
        const network = "testnet";
        const node = "xoFRPv_xsoti6yaZAoZT5zNkU7sAAAAAAAAAAAAAAAA";
        const amount = 449767;
        const to = "tmJ8ngiRiaUVGtExgNgd5nzRF1fSRd47qvP";
        const nonce = 0;

        const result = claimFeesDigest(network, node, amount, to, nonce);
        expect(result).toEqual("PWh08iGFm9txroTLrZmE7e6MPltJ_kurZuGu13mI5Q0");

        const resultHex = base64StringToHexString(result);
        expect(resultHex).toEqual(
            "3d6874f221859bdb71ae84cbad9984edee8c3e5b49fe4bab66e1aed77988e50d",
        );
    });
});
