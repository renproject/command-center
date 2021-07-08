import { expect } from "chai";
import { Token } from "../../ethereum/tokens";
import { unify } from "../../general/debugUtils";
import { parseTokenAmount } from "../../graphQL/queries/queries";
import { tokenArrayToMap } from "../../graphQL/volumes";
import { queryBlockStateResponseMock } from "./currentMock";
import {
    getAggregatedFeeAmountForToken,
    getAggregatedFeesCollection,
    getMinimumAmountForToken,
    getFeeDataForToken,
    getNodeClaimableFee,
    getNodeClaimedFee,
    getNodeFeesCollection,
    getNodeLastNonceClaimed,
    getNodeTotalFee,
    getTokenFeeAmounts,
    getTokenFeeForEpoch,
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

    xtest("gets fee amount for asset", () => {
        //TODO: skip until depreacted data
        const result = getFeeDataForToken("BTC", blockState);
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
            unassigned: "50000000",
        };
        expect(unify(result)).to.eql(expected);
    });

    describe("gets token fee data", () => {
        test("current epoch", () => {
            const reward = getTokenFeeForEpoch("BTC", "current", blockState);
            expect(reward.toNumber()).to.equal(25000000);
        });

        test("previous epoch", () => {
            const reward = getTokenFeeForEpoch("BTC", "previous", blockState);
            expect(reward.toNumber()).to.equal(25000000);
        });

        test("previous epoch per node", () => {
            const reward = getTokenFeeForEpoch(
                "BTC",
                "previous",
                blockState,
                true,
            );
            expect(reward.toNumber()).to.equal(2500000);
        });

        test("current epoch per node", () => {
            const reward = getTokenFeeForEpoch(
                "BTC",
                "current",
                blockState,
                true,
            );
            expect(reward.toNumber()).to.equal(2500000);
        });

        test("current epoch as TokenAmount", () => {
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
});

describe("node fees - basic utils", () => {
    describe("minimum amount", () => {
        test("gets minimum amount", () => {
            const result = getMinimumAmountForToken("BTC", blockState);
            expect(result.toNumber()).to.equal(546);
        });
    });

    describe("gets node last used nonce", () => {
        test("exists & claimed", () => {
            const result = getNodeLastNonceClaimed(
                "R22tRItPlzKCZ5xmhDUNIw/CenwAAAAAAAAAAAAAAAA",
                "BTC",
                blockState,
            );
            expect(result).to.equal(2);
        });

        test("exists & never claimed", () => {
            const result = getNodeLastNonceClaimed(
                "UyR7eXjDqVnArP0aCj4qD/A0w3MAAAAAAAAAAAAAAAA",
                "BTC",
                blockState,
            );
            expect(result).to.equal(0);
        });

        test("not exists", () => {
            const result = getNodeLastNonceClaimed(
                "oNig-tMtnRPeOY00OzxAQHmpMS4AAAAAAAAAAAAAAAA",
                "BTC",
                blockState,
            );
            expect(result).to.equal(null);
        });
    });

    describe("gets node claimed amount", () => {
        test("exists & claimed", () => {
            const result = getNodeClaimedFee(
                "R22tRItPlzKCZ5xmhDUNIw/CenwAAAAAAAAAAAAAAAA",
                "BTC",
                blockState,
            );
            expect(result.toNumber()).to.equal(10000);
        });

        test("exists & never claimed", () => {
            const result = getNodeClaimedFee(
                "UyR7eXjDqVnArP0aCj4qD/A0w3MAAAAAAAAAAAAAAAA",
                "BTC",
                blockState,
            );
            expect(result.toNumber()).to.equal(0);
        });

        test("not exists", () => {
            const result = getNodeClaimedFee(
                "oNig-tMtnRPeOY00OzxAQHmpMS4AAAAAAAAAAAAAAAA",
                "BTC",
                blockState,
            );
            expect(result.toNumber()).to.equal(0);
        });
    });

    describe("gets node total amount", () => {
        test("exists & claimed", () => {
            const result = getNodeTotalFee(
                "R22tRItPlzKCZ5xmhDUNIw/CenwAAAAAAAAAAAAAAAA",
                "BTC",
                blockState,
            );
            expect(result.toNumber()).to.equal(17500000);
        });

        test("exists & never claimed", () => {
            const result = getNodeTotalFee(
                "UyR7eXjDqVnArP0aCj4qD/A0w3MAAAAAAAAAAAAAAAA",
                "BTC",
                blockState,
            );
            expect(result.toNumber()).to.equal(17500000);
        });

        test("not exists", () => {
            const result = getNodeTotalFee(
                "oNig-tMtnRPeOY00OzxAQHmpMS4AAAAAAAAAAAAAAAA",
                "BTC",
                blockState,
            );
            expect(result.toNumber()).to.equal(0);
        });
    });
});

describe("node fees", () => {
    describe("gets node claimable amount", () => {
        test("exists & claimed", () => {
            const result = getNodeClaimableFee(
                "R22tRItPlzKCZ5xmhDUNIw/CenwAAAAAAAAAAAAAAAA",
                "BTC",
                blockState,
            );
            expect(result.toNumber()).to.equal(17490000);
        });

        test("exists & never claimed", () => {
            const result = getNodeClaimableFee(
                "UyR7eXjDqVnArP0aCj4qD/A0w3MAAAAAAAAAAAAAAAA",
                "BTC",
                blockState,
            );
            expect(result.toNumber()).to.equal(17500000);
        });

        test("never claimed for this asset", () => {
            const result = getNodeClaimableFee(
                "R22tRItPlzKCZ5xmhDUNIw/CenwAAAAAAAAAAAAAAAA",
                "DOGE",
                blockState,
            );
            expect(result.toNumber()).to.equal(61318999999.99999);
        });

        test("not exists", () => {
            const result = getNodeClaimableFee(
                "oNig-tMtnRPeOY00OzxAQHmpMS4AAAAAAAAAAAAAAAA",
                "BTC",
                blockState,
            );
            expect(result.toNumber()).to.equal(0);
        });
    });
});

describe("node fees - aggregations", () => {
    describe("get node claimable assets fees", () => {
        test("nonexistent node", () => {
            const result = getNodeFeesCollection(
                "oNig-tMtnRPeOY00OzxAQHmpMS4AAAAAAAAAAAAAAAA",
                blockState,
                "claimable",
            );
            expect(unify(result.get("BTC" as Token)).amount).to.eql(0);
            expect(unify(result.get("ZEC" as Token)).amount).to.eql(0);
        });

        test("node never claimed", () => {
            const result = getNodeFeesCollection(
                "li963gPP4ANqdvHQ8rfC9hxLl7gAAAAAAAAAAAAAAAA",
                blockState,
                "claimable",
            );
            expect(unify(result.get("BTC" as Token)).amount).to.eql(17500000);
            expect(unify(result.get("ZEC" as Token)).amount).to.eql(0);
        });

        test("node claimed", () => {
            const result = getNodeFeesCollection(
                "R22tRItPlzKCZ5xmhDUNIw/CenwAAAAAAAAAAAAAAAA",
                blockState,
                "claimable",
            );
            expect(unify(result.get("BTC" as Token)).amount).to.eql(17490000);
            expect(unify(result.get("ZEC" as Token)).amount).to.eql(0);
        });
    });

    describe("gets node pending fees", () => {
        test("nonexistent node", () => {
            const result = getNodeFeesCollection(
                "oNig-tMtnRPeOY00OzxAQHmpMS4AAAAAAAAAAAAAAAA",
                blockState,
                "pending",
            );
            expect(unify(result.get("BTC" as Token)).amount).to.eql(0);
            expect(unify(result.get("ZEC" as Token)).amount).to.eql(0);
        });

        test("node never claimed", () => {
            const result = getNodeFeesCollection(
                "li963gPP4ANqdvHQ8rfC9hxLl7gAAAAAAAAAAAAAAAA",
                blockState,
                "pending",
            );
            expect(unify(result.get("BTC" as Token)).amount).to.eql(2500000);
            expect(unify(result.get("ZEC" as Token)).amount).to.eql(0);
        });

        test("node claimed", () => {
            const result = getNodeFeesCollection(
                "R22tRItPlzKCZ5xmhDUNIw/CenwAAAAAAAAAAAAAAAA",
                blockState,
                "pending",
            );
            expect(unify(result.get("BTC" as Token)).amount).to.eql(2500000);
            expect(unify(result.get("ZEC" as Token)).amount).to.eql(0);
        });
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
