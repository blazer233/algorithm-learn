module.exports = {
  fjcompose: (...fns) =>
    fns.reduce(
      (f, g) =>
        (...args) =>
          f(g.apply(null, args))
    ),
  tiny:
    (...fns) =>
    (...a) => {
      while (fns.length) a = fns.pop().apply(null, [].concat(a));
      return a;
    },
  compose:
    (...fns) =>
    (...x) =>
      fns.reduceRight((e, o) => o.apply(null, [].concat(e)), x),
};
var a = ['a', 'b', 'c', 'd'];
var b = ['b', 'c'];