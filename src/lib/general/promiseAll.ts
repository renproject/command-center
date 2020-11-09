import { List, OrderedMap } from "immutable";

// FIXME: safePromiseAllList still throws uncaught errors

// The same as Promise.all except that if an entry throws, it sets it to the
// provided default value instead of throwing the entire promise.
export const safePromiseAllList = async <b>(
  orderedMap: List<Promise<b>>,
  defaultValue: b,
): Promise<List<b>> => {
  let newOrderedMap = List<b>();
  for (const valueP of orderedMap.toArray()) {
    try {
      newOrderedMap = newOrderedMap.push(await valueP);
    } catch (error) {
      console.error(error);
      newOrderedMap = newOrderedMap.push(defaultValue);
    }
  }
  return newOrderedMap;
};

// The same as Promise.all except that if an entry throws, it sets it to the
// provided default value instead of throwing the entire promise.
// This variation maps over an OrderedMap instead of an array.
export const safePromiseAllMap = async <a, b>(
  orderedMap: OrderedMap<a, Promise<b>>,
  defaultValue: b,
): Promise<OrderedMap<a, b>> => {
  let newOrderedMap = OrderedMap<a, b>();
  for (const [key, valueP] of orderedMap.toArray()) {
    try {
      newOrderedMap = newOrderedMap.set(key, await valueP);
    } catch (error) {
      console.error(error);
      newOrderedMap = newOrderedMap.set(key, defaultValue);
    }
  }
  return newOrderedMap;
};
