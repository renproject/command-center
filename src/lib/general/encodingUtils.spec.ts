import { expect } from "chai";
import {
    bufferToUrlBase64,
    numberToLeftPaddedUrlBase64,
    urlize,
} from "./encodingUtils";

describe("encoding utils", () => {
    test("urlize", () => {
        const result = urlize("4nUltv8WR1cYvAkz-+=/-G0lHwAAAAAAAAAAAAAAAA");
        expect(result).to.equal("4nUltv8WR1cYvAkz--=_-G0lHwAAAAAAAAAAAAAAAA");
    });

    test("bufferToUrlBase64", () => {
        const result = bufferToUrlBase64(Buffer.from("0000abcdef"));
        expect(result).to.eql("MDAwMGFiY2RlZg");
    });

    test("numberToLeftPaddedUrlBase64 number", () => {
        const result = numberToLeftPaddedUrlBase64(3500000);
        expect(result).to.eql("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1Z-A");
    });

    test("numberToLeftPaddedUrlBase64 string", () => {
        const result = numberToLeftPaddedUrlBase64("3500000");
        expect(result).to.eql("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1Z-A");
    });
});
