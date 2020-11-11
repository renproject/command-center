export const classNames = (...args: Array<string | undefined | null>) => {
    return args
        .filter((arg) => arg !== undefined && arg !== null && arg !== "")
        .join(" ");
};
