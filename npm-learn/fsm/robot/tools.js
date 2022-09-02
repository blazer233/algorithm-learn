export const truthy = () => true;
export const identity = arg => arg;
export const valueEnumerable = value => ({
  enumerable: true,
  value,
});
export const valueEnumerableWritable = value => ({
  enumerable: true,
  writable: true,
  value,
});

//
export const filter = (arr, Type) =>
  arr.filter(value => Type.isPrototypeOf(value));

export const create = (a, b) => Object.freeze(Object.create(a, b));

export const callBoth = (par, fn, self, args) =>
  par.apply(self, args) && fn.apply(self, args);

export const callForward = (par, fn, self, [a, b]) =>
  fn.call(self, par.call(self, a, b), b);
