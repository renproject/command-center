import BigNumber from "bignumber.js";
import { expect } from "chai";
import { parseTokenAmount } from "../../graphQL/queries/queries";
import { tokenArrayToMap } from "../../graphQL/volumes";
import { queryBlockStateResponseMock } from "./currentMock";
import {
    getFeesForAsset,
    getLastEpochClaimed,
    getNodeEnteredAt,
    getTokenFeeAmounts,
    getTokenRewardsForEpoch,
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

    it("maps", () => {
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

    it("gets fee amount for asset", () => {
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

    it("get token rewards for current epoch", () => {
        const reward = getTokenRewardsForEpoch(
            "BTC",
            "current",
            queryBlockStateResponseMock,
        );
        expect(reward.toNumber()).to.equal(50000000);
    });

    it("get token rewards for previous epoch", () => {
        const reward = getTokenRewardsForEpoch(
            "BTC",
            "previous",
            queryBlockStateResponseMock,
        );
        expect(reward.toNumber()).to.equal(100000000);
    });

    it("get token rewards for epoch per node", () => {
        const reward = getTokenRewardsForEpoch(
            "BTC",
            "current",
            queryBlockStateResponseMock,
            true,
        );
        expect(reward.toNumber()).to.equal(5000000);
    });

    it("get token rewards for current epoch", () => {
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

describe("node utils", () => {
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
        const result = getLastEpochClaimed(
            "R22tRItPlzKCZ5xmhDUNIw/CenwAAAAAAAAAAAAAAAA",
            "BTC",
            queryBlockStateResponseMock,
        );
        expect(result).to.equal(2);
    });

    test("gets node last epoch claimed for nonexisting node", () => {
        const result = getLastEpochClaimed(
            "oNig-tMtnRPeOY00OzxAQHmpMS4AAAAAAAAAAAAAAAA",
            "BTC",
            queryBlockStateResponseMock,
        );
        expect(result).to.equal(null);
    });
});
