export const classNames = (...args: Array<string | undefined>) => {
    return args.filter(arg => arg !== undefined).join(" ");
};
