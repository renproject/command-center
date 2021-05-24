import BigNumber from "bignumber.js";
import { describe, it } from "mocha";
import { expect } from "chai";
import { parseTokenAmount } from "../../graphQL/queries/queries";
import { tokenArrayToMap } from "../../graphQL/volumes";
import { queryBlockStateResponseMock } from "./currentMock";
import { getFeesForAsset } from "./feesUtils";
import { partialFees } from "./mocks/fees.mocks";

const numericKeys = ["amount", "amountInUsd", "amountInEth"];

const replacer = (key: any, value: any) => {
    console.log(key, typeof value);
    if (numericKeys.includes(key)) {
        console.log("converting", key, value);
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
    it("unifies", () => {
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
                    amount: "0",
                    epoch: "0",
                    numNodes: "0",
                },
                {
                    amount: "14184320",
                    epoch: "1",
                    numNodes: "13",
                },
                {
                    amount: "27005361",
                    epoch: "2",
                    numNodes: "13",
                },
            ],
            nodes: [
                {
                    node: "Dnc1du8wE8dX1grSGzFszTkGC8wAAAAAAAAAAAAAAAA",
                    lastEpochClaimed: "2",
                },
                {
                    node: "RVI3TISA7NHPUTQbGPWyZa1KWNQAAAAAAAAAAAAAAAA",
                    lastEpochClaimed: "1",
                },
                {
                    node: "yZtuRNsqOGs1FACy6-QQTuA5BbEAAAAAAAAAAAAAAAA",
                    lastEpochClaimed: "2",
                },
            ],
            unassigned: "0",
        };
        expect(unify(result)).to.eql(expected);
    });
});
