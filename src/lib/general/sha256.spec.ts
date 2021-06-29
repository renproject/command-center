import { sha256 } from "ethereumjs-util";
import { sanitizeBase64String } from "./encodingUtils";
import {
    base64Sha256FromBase64String,
    base64Sha256FromTwoBase64Strings,
    base64Sha256FromUtf8String,
} from "./sha256";

describe("sha256", () => {
    test("hashes the right way", () => {
        const value = "3BXVSSgpDzN79JLyUwcWtCTVCG48D35s2t";
        const buffer = Buffer.from(value, "utf8");
        const result = sanitizeBase64String(sha256(buffer).toString("base64"));
        expect(result).toEqual("MHWN14pNl7GqwOj9pQfnomSFhP4HSTC5FguRlGUHg08");
    });

    test("base64sha256FromUtf8String", () => {
        const result = base64Sha256FromUtf8String(
            "3BXVSSgpDzN79JLyUwcWtCTVCG48D35s2t",
        );
        expect(result).toEqual("MHWN14pNl7GqwOj9pQfnomSFhP4HSTC5FguRlGUHg08");
    });

    test("base64Sha256FromBase64String", () => {
        const result = base64Sha256FromBase64String(
            "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU",
        );
        expect(result).toEqual("lt6PyMJW-h4VVtQa9DHKzn3KaHB8eN2Iw6yrixcWTEc");
    });

    test("base64Sha256FromBase64String 2", () => {
        const result = base64Sha256FromBase64String(
            "d7XRfplad6PSXZGf48wUl80TC84AAAAAAAAAAAAAAAA",
        );
        expect(result).toEqual("BHJdF3TeDXyDPjtNZpIcGnG93JN36f8VjBTrEwVd-wE");
    });

    test("base64Sha256FromTwoBase64Strings", () => {
        const result = base64Sha256FromTwoBase64Strings(
            "MHWN14pNl7GqwOj9pQfnomSFhP4HSTC5FguRlGUHg08",
            "BHJdF3TeDXyDPjtNZpIcGnG93JN36f8VjBTrEwVd-wE",
        );
        expect(result).toEqual("ujDyrEiMS2iO3VKCYmwyfy-WP0-xDnfBXYIAALVgmT0");
    });
});
