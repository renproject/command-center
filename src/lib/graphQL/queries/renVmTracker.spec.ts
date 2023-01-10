import { RenNetwork } from "@renproject/interfaces";
import { Currency } from "@renproject/react-components";
import { Map, OrderedMap } from "immutable";
import { Token } from "../../ethereum/tokens";
import { PeriodOption } from "../volumes";

import { renVmTrackerMock } from "./mocks/renvm-tracker.mock";
import {
    buildRenVmTrackerQuery,
    getResolutionEndTimestamp,
    snapshotDataToVolumeData,
    SnapshotRecords,
    TrackerChain,
    TrackerVolumeType,
} from "./renVmTracker";

const snapshotData = renVmTrackerMock.data as any as SnapshotRecords;

describe("tracker utils", () => {
    it("generates query", () => {
        const result = buildRenVmTrackerQuery(
            PeriodOption.ALL,
            RenNetwork.Mainnet,
        );

        expect(result).toBeTruthy();
    });

    it("calcualtes end timestamp", () => {
        const ts = 1627579175851;
        const result = getResolutionEndTimestamp(80, ts);

        expect(result).toEqual(1627579120);
    });

    it("maps", () => {
        const result = snapshotDataToVolumeData(
            snapshotData,
            TrackerVolumeType.Locked,
            TrackerChain.Ethereum,
            Currency.USD,
            OrderedMap<Token, Map<Currency, number>>().set(
                Token.BTC,
                Map<Currency, number>().set(Currency.USD, 1),
            ),
            PeriodOption.ALL,
            {},
            false
        );

        expect(result.difference.toFixed()).toEqual("712723205.72");
    });
});
