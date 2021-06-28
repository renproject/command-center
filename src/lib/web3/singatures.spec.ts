import { claimFeesDigest, prependBytes32 } from "./signatures";

describe("signatures", () => {
    it("merkles", () => {
        const node = "d7XRfplad6PSXZGf48wUl80TC84AAAAAAAAAAAAAAAA";
        const amount = 3500000;
        const to = "3BXVSSgpDzN79JLyUwcWtCTVCG48D35s2t";
        const nonce = 5;

        const result = claimFeesDigest(node, amount, to, nonce);
        expect(result).toEqual("7hynGPeQIo_5VuEWQiMaQ1ayKeTEjCqKA5r81ep5SGU");
    });

    it("prepends bytes", () => {
        const num = 5;
        const result = prependBytes32(num);
        expect(result.toString()).toEqual("AAA");
    });
});
