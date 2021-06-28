import { expect } from "chai";
import { Token } from "../../ethereum/tokens";
import { unify } from "../../general/debugUtils";
import { getNodeEnteredAt, getNodeExists } from "./blockStateUtils";
import { getNodeFeesCollection, getNodePendingFees } from "./feesUtils";
import { queryBlockStateResponse } from "./mocks/fees.bs.testnet.mock";

const blockState = queryBlockStateResponse.result.state.v as any;

const id = "v3MrT4oPN_ZVbmRg59RD7CcFCroAAAAAAAAAAAAAAAA";
// "xoFRPv_xsoti6yaZAoZT5zNkU7sAAAAAAAAAAAAAAAA"

describe("my node", () => {
    test("entered at", () => {
        const result = getNodeEnteredAt(id, blockState);
        expect(result).to.eql(1);
    });

    test("exists", () => {
        const result = getNodeExists(id, blockState);
        expect(result).to.eql(true);
    });

    test("pending BTC", () => {
        const result = getNodePendingFees(id, "BTC", blockState);
        expect(result.toNumber()).to.eql(1256537.05546448087431693989);
    });

    xtest("claimable", () => {
        const result = getNodeFeesCollection(id, blockState, "claimable");
        expect(unify(result.get("BTC" as Token)).amount).to.eql(0);
        expect(unify(result.get("ZEC" as Token)).amount).to.eql(
            34482.75862068965,
        );
    });

    xtest("pending", () => {
        const result = getNodeFeesCollection(id, blockState, "pending");
        expect(unify(result.get("BTC" as Token)).amount).to.eql(
            336.2758620689655,
        );
    });
});
