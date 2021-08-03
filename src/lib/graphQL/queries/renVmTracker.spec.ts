import { PeriodOption } from "../volumes";

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
            PeriodOption.DAY,
        );

        expect(result).toEqual("x");
    });

    it("generates resolution points", () => {
        expect(getResolutionPoints(PeriodOption.HOUR)).toEqual(45);
        expect(getResolutionPoints(PeriodOption.DAY)).toEqual(48);
        expect(getResolutionPoints(PeriodOption.WEEK)).toEqual(84);
        expect(getResolutionPoints(PeriodOption.MONTH)).toEqual(62);
        expect(getResolutionPoints(PeriodOption.YEAR)).toEqual(73);
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
