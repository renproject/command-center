import { claimFeesDigest, prependBytes32 } from "./signatures";
import { sha256, sha256FromString } from "ethereumjs-util";

// export const base64StringToSha256 = (value: string) => {
//     const result =
// }

describe("signatures", () => {
    test("hashes the right way", () => {
        const base64 = "3BXVSSgpDzN79JLyUwcWtCTVCG48D35s2t";
        const buffer = Buffer.from(base64, "base64");
        const result = sha256(buffer).toString("base64");
        expect(result).toEqual("MHWN14pNl7GqwOj9pQfnomSFhP4HSTC5FguRlGUHg08");
    });

    xit("creates signature", () => {
        const node = "d7XRfplad6PSXZGf48wUl80TC84AAAAAAAAAAAAAAAA";
        const amount = 3500000;
        const to = "3BXVSSgpDzN79JLyUwcWtCTVCG48D35s2t";
        const nonce = 5;

        const result = claimFeesDigest(node, amount, to, nonce);
        expect(result).toEqual("7hynGPeQIo_5VuEWQiMaQ1ayKeTEjCqKA5r81ep5SGU");
    });
});
