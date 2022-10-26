export function isArrayLike(obj) {
  return obj && typeof obj.length === "number" && typeof obj != "function";
}

export const isPromise = fn => {
  Object.prototype.toString.call(fn) === "[object AsyncFunction]";
};
