const sumAll = args => args.reduce((a, b) => a + b, 0);

/**
 *两种柯里化的实现
 */

const curry1 = fn => {
  return (judge = (...arg) => {
    return (...args) => {
      return !args.length ? fn(arg) : judge(...arg, ...args);
    };
  });
};
const curry2 = fn => {
  return (judge = (...arg) => {
    if (arg.length == 1) return arg[0];
    return judge.bind(null, fn(arg));
  });
};

curry2(sumAll)(1, 2, 3)(4, 6)();

curry1(sumAll)(1, 2, 3)(4, 6)();
