import { PeriodType } from "../volumes";
import {
    buildRenVmTrackerQuery,
    getResolutionPoints,
    TrackerType,
} from "./renVmTracker";

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
});
