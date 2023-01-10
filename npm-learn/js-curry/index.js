const { tiny, curry } = require("./core");

const sumAll = args => args.reduce((a, b) => a + b, 0);

const ff = new Array(100000).fill(1);

const t0 = performance.now();
const curryFunc = curry(sumAll)(...ff)(4, 6);
curryFunc();
const t1 = performance.now();
console.log(t1 - t0, "curry");

const t2 = performance.now();
const tinyFunc = tiny(sumAll)(...ff)(4, 6);
tinyFunc();
const t3 = performance.now();
console.log(t3 - t2, "tiny");
