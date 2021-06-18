import { expect } from "chai";
import { Token } from "../../ethereum/tokens";
import { unify } from "../../general/debugUtils";
import { parseTokenAmount } from "../../graphQL/queries/queries";
import { tokenArrayToMap } from "../../graphQL/volumes";
import {
    getCurrentEpochId,
    getNodeEnteredAt,
    getNodeExists,
} from "./blockStateUtils";
import { queryBlockStateResponseMock } from "./currentMock";
import {
    getFeesForToken,
    getNodeLastEpochClaimed,
    getTokenFeeAmounts,
    getTokenFeeForEpoch,
    getNodeFirstClaimableEpoch,
    getNodeClaimableFeeForEpoch,
    getLastAssetEpochId,
    getNodeClaimableFees,
    getNodeFeesCollection,
    getNodePendingFees,
    getAggregatedFeesCollection,
    getAggregatedFeeAmountForToken,
} from "./feesUtils";
import { partialFees } from "./mocks/fees.mocks";

const blockState = queryBlockStateResponseMock.result.state.v;

describe("fees", () => {
    test("maps", () => {
        const result = tokenArrayToMap(partialFees.fees)
            .map(parseTokenAmount)
            .toObject();
        const expected = {
            BCH: {
                __typename: "AssetAmount",
                amount: {
                    c: [1263406574],
                    e: 9,
                    s: 1,
                },
                amountInEth: {
                    c: [5, 80493048438697, 64440000000000],
                    e: 0,
                    s: 1,
                },
                amountInUsd: {
                    c: [5298, 92000000000000],
                    e: 3,
                    s: 1,
                },
                asset: {
                    __typename: "Asset",
                    decimals: 8,
                },
                symbol: "renBCH",
            },
        };
        expect(unify(result)).to.eql(unify(expected));
    });

    test("gets fee amount for asset", () => {
        const result = getFeesForToken("BTC", blockState);
        const expected = {
            epochs: [
                {
                    amount: 0,
                    epoch: "0",
                    numNodes: "0",
                },
                {
                    amount: 100000000, // 1BTC
                    epoch: "1",
                    numNodes: "10",
                },
                {
                    amount: 50000000, // 0.5 BTC
                    epoch: "2",
                    numNodes: "10",
                },
                {
                    amount: 25000000, // 0.25 BTC
                    epoch: "3",
                    numNodes: "10",
                },
            ],
            nodes: [
                {
                    node: "Dnc1du8wE8dX1grSGzFszTkGC8wAAAAAAAAAAAAAAAA",
                    lastEpochClaimed: "2",
                },
                {
                    node: "UyR7eXjDqVnArP0aCj4qD/A0w3MAAAAAAAAAAAAAAAA",
                    lastEpochClaimed: "1",
                },
                {
                    node: "R22tRItPlzKCZ5xmhDUNIw/CenwAAAAAAAAAAAAAAAA",
                    lastEpochClaimed: "2",
                },
            ],
            unassigned: "0",
        };
        expect(unify(result)).to.eql(expected);
    });

    test("get token rewards for current epoch", () => {
        const reward = getTokenFeeForEpoch("BTC", "current", blockState);
        expect(reward.toNumber()).to.equal(25000000);
    });

    test("get token rewards for previous epoch", () => {
        const reward = getTokenFeeForEpoch("BTC", "previous", blockState);
        expect(reward.toNumber()).to.equal(50000000);
    });

    test("get token rewards for epoch per node", () => {
        const reward = getTokenFeeForEpoch("BTC", "current", blockState, true);
        expect(reward.toNumber()).to.equal(2500000);
    });

    test("get token rewards for current epoch", () => {
        const reward = getTokenFeeForEpoch("BTC", "current", blockState);
        const amounts = getTokenFeeAmounts(reward, "BTC", 8, null);
        expect(unify(amounts)).to.eql(
            unify({
                amount: 25000000,
                amountInUsd: 0,
                amountInEth: 0,
                symbol: "BTC",
                asset: {
                    decimals: 8,
                },
            }),
        );
    });
});

describe("node fees - basic utils", () => {
    test("gets node last epoch claimed", () => {
        const result = getNodeLastEpochClaimed(
            "R22tRItPlzKCZ5xmhDUNIw/CenwAAAAAAAAAAAAAAAA",
            "BTC",
            blockState,
        );
        expect(result).to.equal(2);
    });

    test("gets node last epoch claimed for nonexisting node", () => {
        const result = getNodeLastEpochClaimed(
            "oNig-tMtnRPeOY00OzxAQHmpMS4AAAAAAAAAAAAAAAA",
            "BTC",
            blockState,
        );
        expect(result).to.equal(null);
    });

    test("gets last epoch id", () => {
        const result = getLastAssetEpochId("BTC", blockState);
        expect(result).to.equal(3);
    });

    test("gets last epoch id for asset with empty epochs", () => {
        const result = getLastAssetEpochId("ZEC", blockState);
        expect(result).to.equal(null);
    });
});

describe("node epoch utils", () => {
    test("gets node first claimable epoch", () => {
        const result = getNodeFirstClaimableEpoch(
            "R22tRItPlzKCZ5xmhDUNIw/CenwAAAAAAAAAAAAAAAA",
            "BTC",
            blockState,
        );
        expect(result).to.equal(3);
    });

    test("gets node first claimable epoch 2", () => {
        const result = getNodeFirstClaimableEpoch(
            "UyR7eXjDqVnArP0aCj4qD/A0w3MAAAAAAAAAAAAAAAA",
            "BTC",
            blockState,
        );
        expect(result).to.equal(2);
    });

    test("gets node first claimable epoch for nonexistent node", () => {
        const result = getNodeFirstClaimableEpoch(
            "oNig-tMtnRPeOY00OzxAQHmpMS4AAAAAAAAAAAAAAAA",
            "BTC",
            blockState,
        );
        expect(result).to.equal(null);
    });

    test("gets node claimable fee for epoch (no claimable epochs)", () => {
        const result = getNodeClaimableFeeForEpoch(
            "R22tRItPlzKCZ5xmhDUNIw/CenwAAAAAAAAAAAAAAAA",
            "BTC",
            2,
            blockState,
        );
        expect(result.toNumber()).to.equal(0);
    });

    test("gets node claimable fee for epoch (has claimable epochs)", () => {
        const result = getNodeClaimableFeeForEpoch(
            "UyR7eXjDqVnArP0aCj4qD/A0w3MAAAAAAAAAAAAAAAA",
            "BTC",
            2,
            blockState,
        );
        expect(result.toNumber()).to.equal(5000000);
    });

    test("gets node claimable fee for epoch (nonexistent node)", () => {
        const result = getNodeClaimableFeeForEpoch(
            "oNig-tMtnRPeOY00OzxAQHmpMS4AAAAAAAAAAAAAAAA",
            "BTC",
            2,
            blockState,
        );
        expect(result.toNumber()).to.equal(0);
    });
});

describe("node fees", () => {
    test("gets node claimable fees (node never claimed)", () => {
        const result = getNodeClaimableFees(
            "li963gPP4ANqdvHQ8rfC9hxLl7gAAAAAAAAAAAAAAAA",
            "BTC",
            blockState,
        );
        expect(result.toNumber()).to.equal(15000000);
    });

    test("gets node claimable fees (node claimed in previous-1 epoch)", () => {
        const result = getNodeClaimableFees(
            "UyR7eXjDqVnArP0aCj4qD/A0w3MAAAAAAAAAAAAAAAA",
            "BTC",
            blockState,
        );
        expect(result.toNumber()).to.equal(5000000);
    });

    test("gets node claimable fees (node claimed in previous epoch)", () => {
        const result = getNodeClaimableFees(
            "R22tRItPlzKCZ5xmhDUNIw/CenwAAAAAAAAAAAAAAAA",
            "BTC",
            blockState,
        );
        expect(result.toNumber()).to.equal(0);
    });

    test("gets node claimable fees (never claimed for this asset)", () => {
        const result = getNodeClaimableFees(
            "R22tRItPlzKCZ5xmhDUNIw/CenwAAAAAAAAAAAAAAAA",
            "DOGE",
            blockState,
        );
        expect(result.toNumber()).to.equal(54418999999.99999);
    });

    test("gets node claimable fees (nonexistent node)", () => {
        const result = getNodeClaimableFees(
            "oNig-tMtnRPeOY00OzxAQHmpMS4AAAAAAAAAAAAAAAA",
            "BTC",
            blockState,
        );
        expect(result.toNumber()).to.equal(0);
    });

    test("gets node pending fees (node claimed in previous epoch)", () => {
        const result = getNodePendingFees(
            "R22tRItPlzKCZ5xmhDUNIw/CenwAAAAAAAAAAAAAAAA",
            "BTC",
            blockState,
        );
        expect(result.toNumber()).to.equal(2500000);
    });

    test("gets node pending fees (nonexistent node)", () => {
        const result = getNodePendingFees(
            "oNig-tMtnRPeOY00OzxAQHmpMS4AAAAAAAAAAAAAAAA",
            "BTC",
            blockState,
        );
        expect(result.toNumber()).to.equal(0);
    });
});

describe("node fees - aggregations", () => {
    test("get node claimable assets fees (nonexistent node)", () => {
        const result = getNodeFeesCollection(
            "oNig-tMtnRPeOY00OzxAQHmpMS4AAAAAAAAAAAAAAAA",
            blockState,
            "claimable",
        );
        expect(unify(result.get("BTC" as Token)).amount).to.eql(0);
        expect(unify(result.get("ZEC" as Token)).amount).to.eql(0);
    });

    test("get node claimable assets fees (node never claimed)", () => {
        const result = getNodeFeesCollection(
            "li963gPP4ANqdvHQ8rfC9hxLl7gAAAAAAAAAAAAAAAA",
            blockState,
            "claimable",
        );
        expect(unify(result.get("BTC" as Token)).amount).to.eql(15000000);
        expect(unify(result.get("ZEC" as Token)).amount).to.eql(0);
    });

    test("get node claimable assets fees (node claimed in previous-1 epoch)", () => {
        const result = getNodeFeesCollection(
            "UyR7eXjDqVnArP0aCj4qD/A0w3MAAAAAAAAAAAAAAAA",
            blockState,
            "claimable",
        );
        expect(unify(result.get("BTC" as Token)).amount).to.eql(5000000);
        expect(unify(result.get("ZEC" as Token)).amount).to.eql(0);
    });

    test("get node pending assets fees (nonexistent node)", () => {
        const result = getNodeFeesCollection(
            "oNig-tMtnRPeOY00OzxAQHmpMS4AAAAAAAAAAAAAAAA",
            blockState,
            "claimable",
        );
        expect(unify(result.get("BTC" as Token)).amount).to.eql(0);
        expect(unify(result.get("ZEC" as Token)).amount).to.eql(0);
    });

    test("get node pending assets fees (node never claimed)", () => {
        const result = getNodeFeesCollection(
            "li963gPP4ANqdvHQ8rfC9hxLl7gAAAAAAAAAAAAAAAA",
            blockState,
            "pending",
        );
        expect(unify(result.get("BTC" as Token)).amount).to.eql(2500000);
        expect(unify(result.get("ZEC" as Token)).amount).to.eql(0);
    });

    test("get node pending assets fees (node claimed in previous-1 epoch)", () => {
        const result = getNodeFeesCollection(
            "UyR7eXjDqVnArP0aCj4qD/A0w3MAAAAAAAAAAAAAAAA",
            blockState,
            "pending",
        );
        expect(unify(result.get("BTC" as Token)).amount).to.eql(2500000);
        expect(unify(result.get("ZEC" as Token)).amount).to.eql(0);
    });
});

describe("total fees - aggregations", () => {
    test("aggregated fee amount for token", () => {
        const btc = getAggregatedFeeAmountForToken("BTC", blockState);
        const doge = getAggregatedFeeAmountForToken("DOGE", blockState);
        const zec = getAggregatedFeeAmountForToken("ZEC", blockState);
        expect(btc.toNumber()).to.eql(175000000);
        expect(doge.toNumber()).to.eql(613190000000);
        expect(zec.toNumber()).to.eql(0);
    });

    test("aggregated fee amounts for tokens", () => {
        const result = getAggregatedFeesCollection(blockState);
        expect(unify(result.get("BTC" as Token)).amount).to.eql(175000000);
        expect(unify(result.get("DOGE" as Token)).amount).to.eql(613190000000);
        expect(unify(result.get("ZEC" as Token)).amount).to.eql(0);
    });
});
