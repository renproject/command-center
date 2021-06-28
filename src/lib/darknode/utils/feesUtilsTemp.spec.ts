import { expect } from "chai";
import { Token } from "../../ethereum/tokens";
import { unify } from "../../general/debugUtils";
import { getNodeEnteredAt } from "./blockStateUtils";
import { getNodeFeesCollection } from "./feesUtils";
import { queryBlockStateResponse } from "./mocks/fees.bs.testnet.mock";

const blockState = queryBlockStateResponse.result.state.v as any;

describe("my node", () => {
    test("entered at", () => {
        const result = getNodeEnteredAt(
            "xoFRPv_xsoti6yaZAoZT5zNkU7sAAAAAAAAAAAAAAAA",
            blockState,
        );
        expect(result).to.eql(3);
    });

    test("claimable", () => {
        const result = getNodeFeesCollection(
            "xoFRPv_xsoti6yaZAoZT5zNkU7sAAAAAAAAAAAAAAAA",
            blockState,
            "claimable",
        );
        expect(unify(result.get("BTC" as Token)).amount).to.eql(0);
        expect(unify(result.get("ZEC" as Token)).amount).to.eql(
            34482.75862068965,
        );
    });

    test("pending", () => {
        const result = getNodeFeesCollection(
            "xoFRPv_xsoti6yaZAoZT5zNkU7sAAAAAAAAAAAAAAAA",
            blockState,
            "pending",
        );
        expect(unify(result.get("BTC" as Token)).amount).to.eql(
            336.2758620689655,
        );
        expect(unify(result.get("ZEC" as Token)).amount).to.eql(
            398844.8620689655,
        );
    });
});
