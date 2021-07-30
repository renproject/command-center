export const isDefined = <T>(x: T): x is NonNullable<T> => {
    return x !== null && x !== undefined;
};

export const isEmptyObject = (obj: any) => {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
};
