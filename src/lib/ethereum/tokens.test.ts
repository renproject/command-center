// import { MultiAddress } from "../types/types";
import { btcMainnetRegex, btcTestnetRegex } from "./tokens";

const testnetAddresses = [
    "mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn",
    "2MzQwSSnBHWHqSAqtTVQ6v47XtaisrJa1Vc",
];

const mainnetAddresses = [
    "17VZNX1SN5NtKa8UQFxwQbFeFc3iqRYhem",
    "3EktnHQD7RiAE6uzMj2ZifT9YgRrkSgzQX",
];

const badAddresses = [
    "0x17VZNX1SN5NtKa8UQFxwQbFeFc3iqRYhem",
];

test("btcTestnetRegex", async () => {
    testnetAddresses.map((address) => expect(btcTestnetRegex.test(address)).toBeTruthy());
    mainnetAddresses.map((address) => expect(btcTestnetRegex.test(address)).toBeFalsy());
    badAddresses.map((address) => expect(btcTestnetRegex.test(address)).toBeFalsy());
});

test("btcMainnetRegex", async () => {
    mainnetAddresses.map((address) => expect(btcMainnetRegex.test(address)).toBeTruthy());
    testnetAddresses.map((address) => expect(btcMainnetRegex.test(address)).toBeFalsy());
    badAddresses.map((address) => expect(btcMainnetRegex.test(address)).toBeFalsy());
});
