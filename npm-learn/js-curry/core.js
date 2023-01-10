module.exports = {
  curry: fn => {
    return (judge = (...arg) => {
      return (...args) => (!args.length ? fn(arg) : judge(...arg, ...args));
    });
  },
  tiny: fn => {
    return (judge = (...arg) => {
      if (arg.length == 1) return arg[0];
      return judge.bind(null, fn(arg));
    });
  },
};
