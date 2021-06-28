import { expect } from "chai";
import {
    getCurrentEpochId,
    getNodeEnteredAt,
    getNodeExists,
} from "./blockStateUtils";
import { queryBlockStateResponseMock } from "./currentMock";
const blockState = queryBlockStateResponseMock.result.state.v;

describe("node basic utils", () => {
    test("checks if node not exists", () => {
        const result = getNodeExists("nonexistent", blockState);
        expect(result).to.equal(false);
    });

    test("checks node exists", () => {
        const result = getNodeExists(
            "R22tRItPlzKCZ5xmhDUNIw/CenwAAAAAAAAAAAAAAAA",
            blockState,
        );
        expect(result).to.equal(true);
    });

    test("gets current epoch id", () => {
        const result = getCurrentEpochId(blockState);
        expect(result).to.equal(4);
    });

    test("gets node entered at", () => {
        const result = getNodeEnteredAt(
            "R22tRItPlzKCZ5xmhDUNIw/CenwAAAAAAAAAAAAAAAA",
            blockState,
        );
        expect(result).to.equal(1);
    });

    test("gets node entered at for nonexisting node", () => {
        const result = getNodeEnteredAt(
            "oNig-tMtnRPeOY00OzxAQHmpMS4AAAAAAAAAAAAAAAA",
            blockState,
        );
        expect(result).to.equal(null);
    });
});
