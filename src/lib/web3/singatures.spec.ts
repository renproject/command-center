import { sanitizeBase64String } from "../general/encodingUtils";
import { claimFeesDigest } from "./signatures";
import { sha256, sha256FromString } from "ethereumjs-util";

// export const base64StringToSha256 = (value: string) => {
//     const result =
// }

describe("signatures", () => {
    test("creates signature", () => {
        const network = "testnet";
        // const network = "testnesAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
        const node = "d7XRfplad6PSXZGf48wUl80TC84AAAAAAAAAAAAAAAA";
        const amount = 3500000;
        const to = "3BXVSSgpDzN79JLyUwcWtCTVCG48D35s2t";
        const nonce = 5;

        const result = claimFeesDigest(network, node, amount, to, nonce);
        expect(result).toEqual("3h_5aaYsPy99VKGieabycNsaaSM9EJQNo7onjmVhq38");
    });
});
