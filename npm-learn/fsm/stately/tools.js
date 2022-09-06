export const isStr = arg => arg && typeof arg === "string";
export const isObj = arg => arg && typeof arg === "object";
export const isFun = arg => arg && typeof arg === "function";
export const isEqu = (obj1, obj2) => Object.is(obj1, obj2);
