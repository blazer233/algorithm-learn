const { tiny, compose, fjcompose } = require("./core");

const str = x => `|| ${x} ||`;
const sqr = x => x;
const add = (x, y) => x + y;
const args = new Array(1).fill(sqr);

const t4 = performance.now();
const blastOff3 = compose(str, ...args, add);
const t5 = performance.now();
console.log(t5 - t4, "compose", blastOff3(2, 3));

const t0 = performance.now();
const blastOff = tiny(str, ...args, add);
const t1 = performance.now();
console.log(t1 - t0, "tiny", blastOff(2, 3));

const t2 = performance.now();
const blastOff2 = fjcompose(str, ...args, add);
const t3 = performance.now();
console.log(t3 - t2, "fjcompose", blastOff2(2, 3));

/**
  0.0601000040769577 compose || 5 ||
  0.06380000710487366 tiny || 5 ||
  1.0467000007629395 fjcompose || 5 ||
 */
