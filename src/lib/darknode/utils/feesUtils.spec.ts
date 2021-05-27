import BigNumber from "bignumber.js";
import { expect } from "chai";
import { Token } from "../../ethereum/tokens";
import { parseTokenAmount } from "../../graphQL/queries/queries";
import { tokenArrayToMap } from "../../graphQL/volumes";
import { queryBlockStateResponseMock } from "./currentMock";
import {
    getFeesForAsset,
    getNodeLastEpochClaimed,
    getNodeEnteredAt,
    getTokenFeeAmounts,
    getTokenRewardsForEpoch,
    getNodeFirstClaimableEpoch,
    getNodeClaimableFeeForEpoch,
    getLastEpochId,
    getNodeClaimableFees,
    getNodeFeesCollection,
} from "./feesUtils";
import { partialFees } from "./mocks/fees.mocks";

const numericKeys = ["amount", "amountInUsd", "amountInEth"];

const replacer = (key: any, value: any) => {
    if (numericKeys.includes(key)) {
        if (typeof value === "object") {
            return new BigNumber({ ...value, _isBigNumber: true }).toNumber();
        } else if (typeof value === "string") {
            return Number(value);
        }
        return value;
    }
    return value;
};

const unify = (obj: any) => {
    return JSON.parse(JSON.stringify(obj, replacer));
};

describe("fees", () => {
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
        const result = getFeesForAsset("BTC", queryBlockStateResponseMock);
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
        const reward = getTokenRewardsForEpoch(
            "BTC",
            "current",
            queryBlockStateResponseMock,
        );
        expect(reward.toNumber()).to.equal(50000000);
    });

    test("get token rewards for previous epoch", () => {
        const reward = getTokenRewardsForEpoch(
            "BTC",
            "previous",
            queryBlockStateResponseMock,
        );
        expect(reward.toNumber()).to.equal(100000000);
    });

    test("get token rewards for epoch per node", () => {
        const reward = getTokenRewardsForEpoch(
            "BTC",
            "current",
            queryBlockStateResponseMock,
            true,
        );
        expect(reward.toNumber()).to.equal(5000000);
    });

    test("get token rewards for current epoch", () => {
        const reward = getTokenRewardsForEpoch(
            "BTC",
            "current",
            queryBlockStateResponseMock,
        );
        const amounts = getTokenFeeAmounts(reward, "BTC", 8, null);
        expect(unify(amounts)).to.eql(
            unify({
                amount: 50000000,
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

describe("node basic utils", () => {
    test("gets node entered at", () => {
        const result = getNodeEnteredAt(
            "R22tRItPlzKCZ5xmhDUNIw/CenwAAAAAAAAAAAAAAAA",
            queryBlockStateResponseMock,
        );
        expect(result).to.equal(1);
    });

    test("gets node entered at for nonexisting node", () => {
        const result = getNodeEnteredAt(
            "oNig-tMtnRPeOY00OzxAQHmpMS4AAAAAAAAAAAAAAAA",
            queryBlockStateResponseMock,
        );
        expect(result).to.equal(null);
    });

    test("gets node last epoch claimed", () => {
        const result = getNodeLastEpochClaimed(
            "R22tRItPlzKCZ5xmhDUNIw/CenwAAAAAAAAAAAAAAAA",
            "BTC",
            queryBlockStateResponseMock,
        );
        expect(result).to.equal(2);
    });

    test("gets node last epoch claimed for nonexisting node", () => {
        const result = getNodeLastEpochClaimed(
            "oNig-tMtnRPeOY00OzxAQHmpMS4AAAAAAAAAAAAAAAA",
            "BTC",
            queryBlockStateResponseMock,
        );
        expect(result).to.equal(null);
    });

    test("gets last epoch id", () => {
        const result = getLastEpochId("BTC", queryBlockStateResponseMock);
        expect(result).to.equal(2);
    });

    test("gets last epoch id for asset with empty epochs", () => {
        const result = getLastEpochId("ZEC", queryBlockStateResponseMock);
        expect(result).to.equal(null);
    });
});

describe("node epoch utils", () => {
    test("gets node first claimable epoch", () => {
        const result = getNodeFirstClaimableEpoch(
            "R22tRItPlzKCZ5xmhDUNIw/CenwAAAAAAAAAAAAAAAA",
            "BTC",
            queryBlockStateResponseMock,
        );
        expect(result).to.equal(3);
    });

    test("gets node first claimable epoch 2", () => {
        const result = getNodeFirstClaimableEpoch(
            "UyR7eXjDqVnArP0aCj4qD/A0w3MAAAAAAAAAAAAAAAA",
            "BTC",
            queryBlockStateResponseMock,
        );
        expect(result).to.equal(2);
    });

    test("gets node first claimable epoch for nonexistent node", () => {
        const result = getNodeFirstClaimableEpoch(
            "oNig-tMtnRPeOY00OzxAQHmpMS4AAAAAAAAAAAAAAAA",
            "BTC",
            queryBlockStateResponseMock,
        );
        expect(result).to.equal(null);
    });

    test("gets node claimable fee for epoch (no claimable epochs)", () => {
        const result = getNodeClaimableFeeForEpoch(
            "R22tRItPlzKCZ5xmhDUNIw/CenwAAAAAAAAAAAAAAAA",
            "BTC",
            2,
            queryBlockStateResponseMock,
        );
        expect(result.toNumber()).to.equal(0);
    });

    test("gets node claimable fee for epoch (has claimable epochs)", () => {
        const result = getNodeClaimableFeeForEpoch(
            "UyR7eXjDqVnArP0aCj4qD/A0w3MAAAAAAAAAAAAAAAA",
            "BTC",
            2,
            queryBlockStateResponseMock,
        );
        expect(result.toNumber()).to.equal(5000000);
    });

    test("gets node claimable fee for epoch (nonexistent node)", () => {
        const result = getNodeClaimableFeeForEpoch(
            "oNig-tMtnRPeOY00OzxAQHmpMS4AAAAAAAAAAAAAAAA",
            "BTC",
            2,
            queryBlockStateResponseMock,
        );
        expect(result.toNumber()).to.equal(0);
    });
});

describe("node fees", () => {
    test("get node claimable fees (node never claimed)", () => {
        const result = getNodeClaimableFees(
            "li963gPP4ANqdvHQ8rfC9hxLl7gAAAAAAAAAAAAAAAA",
            "BTC",
            queryBlockStateResponseMock,
        );
        expect(result.toNumber()).to.equal(15000000);
    });

    test("get node claimable fees (node already claimed in previous-1 epoch)", () => {
        const result = getNodeClaimableFees(
            "UyR7eXjDqVnArP0aCj4qD/A0w3MAAAAAAAAAAAAAAAA",
            "BTC",
            queryBlockStateResponseMock,
        );
        expect(result.toNumber()).to.equal(5000000);
    });

    test("get node claimable fees (node claimed in previous epoch)", () => {
        const result = getNodeClaimableFees(
            "R22tRItPlzKCZ5xmhDUNIw/CenwAAAAAAAAAAAAAAAA",
            "BTC",
            queryBlockStateResponseMock,
        );
        expect(result.toNumber()).to.equal(0);
    });

    test("get node claimable fees (nonexistent node)", () => {
        const result = getNodeClaimableFees(
            "oNig-tMtnRPeOY00OzxAQHmpMS4AAAAAAAAAAAAAAAA",
            "BTC",
            queryBlockStateResponseMock,
        );
        expect(result.toNumber()).to.equal(0);
    });
});

describe("node fees - aggregations", () => {
    test("get node claimable assets fees (nonexistent node)", () => {
        const result = getNodeFeesCollection(
            "oNig-tMtnRPeOY00OzxAQHmpMS4AAAAAAAAAAAAAAAA",
            queryBlockStateResponseMock,
        );
        expect(unify(result.get("BTC" as Token)).amount).to.eql(0);
        expect(unify(result.get("ZEC" as Token)).amount).to.eql(0);
    });

    test("get node claimable assets fees (node never claimed)", () => {
        const result = getNodeFeesCollection(
            "li963gPP4ANqdvHQ8rfC9hxLl7gAAAAAAAAAAAAAAAA",
            queryBlockStateResponseMock,
        );
        expect(unify(result.get("BTC" as Token)).amount).to.eql(15000000);
        expect(unify(result.get("ZEC" as Token)).amount).to.eql(0);
    });
});
