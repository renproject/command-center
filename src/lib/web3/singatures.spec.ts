import { base64StringToHexString } from "../general/encodingUtils";
import { claimFeesDigest } from "./signatures";

describe("signatures", () => {
    test("creates signature", () => {
        const asset = "ZEC";
        const network = "testnet";
        const node = "xoFRPv_xsoti6yaZAoZT5zNkU7sAAAAAAAAAAAAAAAA";
        const amount = 449767;
        const to = "tmJ8ngiRiaUVGtExgNgd5nzRF1fSRd47qvP";
        const nonce = 0;

        const result = claimFeesDigest(asset, network, node, amount, to, nonce);
        expect(result).toEqual("r0UE-lKA9DONHg13fOlOdU0PX1MIU5b798eaXdE_ahg");

        const resultHex = base64StringToHexString(result);
        expect(resultHex).toEqual(
            "af4504fa5280f4338d1e0d777ce94e754d0f5f53085396fbf7c79a5dd13f6a18",
        );
    });
});
