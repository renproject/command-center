import { expect } from "chai";
import { unify } from "./debugUtils";

describe("debug utils", () => {
    test("unifies", () => {
        const obj = {
            amount: {
                c: [1263406574],
                e: 9,
                s: 1,
            },
        };
        const expected = {
            amount: 1263406574,
        };
        expect(unify(obj)).to.eql(expected);
    });
});
