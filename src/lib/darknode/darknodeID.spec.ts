import { expect } from "chai";
import {
    darknodeIDBase58ToHex,
    darknodeIDBase58ToRenVmID,
    darknodeIDHexToBase58,
    renVMID2Base58,
} from "./darknodeID";

describe("darknode ids", () => {
    test("decodes ethereum address to base58", () => {
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
        const address = darknodeIDBase58ToRenVmID(id);
        expect(address).to.equal("34i8lj5hT6sr2oHCmAVroY4BpCQAAAAAAAAAAAAAAAA");
        expect(address.length).to.equal(43);
    });

    test("decodes renVM id to base58", () => {
        const id = "34i8lj5hT6sr2oHCmAVroY4BpCQAAAAAAAAAAAAAAAA";
        const result = renVMID2Base58(id);
        expect(result).to.equal("8MKAUt5TKKdP4PpKmgfjEBwcXSbbXq");
        expect(result.length).to.equal(30);
    });
});
