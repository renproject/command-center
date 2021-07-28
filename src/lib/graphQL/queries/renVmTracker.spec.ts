import { PeriodType } from "../volumes";

import { renVmTrackerMock } from "./mocks/renvm-tracker.mock";
import {
    buildRenVmTrackerQuery,
    getResolutionPoints,
    snapshotDataToTokenAmountRecords,
    SnapshotRecord,
    TrackerChain,
    TrackerType,
} from "./renVmTracker";

const snapshotData = renVmTrackerMock.data as SnapshotRecord;

describe("tracker utils", () => {
    xit("generates query", () => {
        const result = buildRenVmTrackerQuery(
            TrackerType.Volume,
            PeriodType.DAY,
        );

        expect(result).toEqual("x");
    });

    it("generates resolution points", () => {
        expect(getResolutionPoints(PeriodType.HOUR)).toEqual(45);
        expect(getResolutionPoints(PeriodType.DAY)).toEqual(48);
        expect(getResolutionPoints(PeriodType.WEEK)).toEqual(84);
        expect(getResolutionPoints(PeriodType.MONTH)).toEqual(62);
        expect(getResolutionPoints(PeriodType.YEAR)).toEqual(73);
        // expect(getResolutionPoints(PeriodType.ALL)).toEqual(71);
    });

    it("maps", () => {
        const result = snapshotDataToTokenAmountRecords(
            snapshotData,
            TrackerType.Volume,
            TrackerChain.Ethereum,
        );
    });
});
