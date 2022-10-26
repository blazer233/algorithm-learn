const identity = x => x;
/**
 * 创建空对象
 * @returns
 */
export function createEmptyObject() {
  return Object.create(null);
}
/**
 * 创建空函数
 * @returns
 */
export function noop() {
  return function () {};
}
/**
 * 创建空异常
 * @returns
 */
export function defaultErrorHandler(err) {
  throw err;
}

export function pipeFromArray(funcs) {
  const len = funcs.length;
  if (len == 0) return identity;
  if (len == 1) return funcs[0];
  return input => funcs.reduce((prev, fn) => fn(prev), input);
}

export const EMPTY_OBSERVER = {
  closed: true,
  next: noop,
  error: defaultErrorHandler,
  complete: noop,
};

export function arrRemove(arr, item) {
  if (arr) {
    const index = arr.indexOf(item);
    0 <= index && arr.splice(index, 1);
  }
}

export const tryInstanceof = () => {};
