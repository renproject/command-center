export const isDefined = <T>(x: T): x is NonNullable<T> => {
  return x !== null && x !== undefined;
};
