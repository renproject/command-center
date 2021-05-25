import { expect } from "chai";
import {
    darknodeIDBase58ToHex,
    darknodeIDBase58ToPaddedBase64,
    darknodeIDHexToBase58,
} from "./darknodeID";

describe("darknode ids", () => {
    test("encodes ethereum address to base58", () => {
        const id = "0xdf88bc963E614FAB2bda81c298056ba18e01A424";
        const result = darknodeIDHexToBase58(id);
        expect(result).to.equal("8MKAUt5TKKdP4PpKmgfjEBwcXSbbXq");
    });

    test("encodes base58 to extended ethereum address", () => {
        const id = "8MKAUt5TKKdP4PpKmgfjEBwcXSbbXq";
        const result = darknodeIDBase58ToHex(id);
        expect(result).to.equal("0xdf88bc963E614FAB2bda81c298056ba18e01A424");
    });

    test("encodes base58 to renVM id", () => {
        const id = "8MKAUt5TKKdP4PpKmgfjEBwcXSbbXq";
        const address = darknodeIDBase58ToPaddedBase64(id);
        expect(address).to.equal("0000000000000");
    });
});
