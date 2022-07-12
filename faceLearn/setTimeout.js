let timer;
const repeat = (func, ms) => {
  timer && clearTimeout(timer);
  timer = setTimeout(() => {
    func();
    repeat(func, ms);
  }, ms);
};
