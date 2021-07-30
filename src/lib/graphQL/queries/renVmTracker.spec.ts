import { PeriodType } from "../volumes";

import { renVmTrackerMock } from "./mocks/renvm-tracker.mock";
import {
    buildRenVmTrackerQuery,
    getResolutionEndTimestamp,
    getResolutionPoints,
    snapshotDataToVolumeData,
    SnapshotRecords,
    TrackerChain,
    TrackerVolumeType,
} from "./renVmTracker";

const snapshotData = renVmTrackerMock.data as SnapshotRecords;

describe("tracker utils", () => {
    xit("generates query", () => {
        const result = buildRenVmTrackerQuery(
            TrackerVolumeType.Transacted,
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

    it("calcualtes end timestamp", () => {
        const ts = 1627579175851;
        const result = getResolutionEndTimestamp(80, ts);

        expect(result).toEqual(1627579120);
    });

    it("maps", () => {
        // const result = snapshotDataToVolumeData(
        //     snapshotData,
        //     TrackerType.Volume,
        //     TrackerChain.Ethereum,
        // );
    });
});
