const minSm = 544;
const minMd = 768;
const minLg = 992;
const minXl = 1240;
const minXxl = 1440;
const maxXs = minSm - 1;
const maxSm = minMd - 1;
const maxMd = minLg - 1;
const maxLg = minXl - 1;
const maxXl = minXxl - 1;

export const theme = {
    colors: {
        offWhite: "#f8fafb",
        darkGrey: "#3f3f41",
        lightGrey: "#cccccc",
        midGrey: "#979797",

        // green: "#31cc9a",
        green: "#3cbc98",
        red: "#f45532",
        orange: "#db6500",
        lightRed: "#f16262",

        primary: "#006fe8",
        blueDark: "#002247",
        // blueDarker: "#001b3a",
        blueDarker: "#001732",
    },

    grid: {
        minSm,
        minMd,
        minLg,
        minXl,
        minXxl,

        maxXs,
        maxSm,
        maxMd,
        maxLg,
        maxXl,
    },
};

export type ThemeType = typeof theme;
