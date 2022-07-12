const sleep = t => new Promise(res => setTimeout(res, 1000, t));

/* async 函数实现 */

async function test() {
  const data = await sleep(1000);
  console.log("data: ", data);
  const data2 = await sleep(1000);
  console.log("data2: ", data2);
  return "success";
}

test().then(res => console.log(res));

/* generator 函数实现 */

function* testG(arg) {
  console.log(arg);
  const data = yield sleep(1000);
  console.log("data: ", data);
  const data2 = yield sleep(1000);
  console.log("data2: ", data2);
  return "success";
}

function asyncToGenerator(fn, ...arg) {
  const gen = fn(...arg);
  return new Promise((resolve, reject) => {
    const step = (key = "next", arg) => {
      let generatorResult;
      try {
        generatorResult = gen[key](arg);
      } catch (error) {
        return reject(error);
      }
      if (generatorResult.done) return resolve(generatorResult.value);
      return Promise.resolve(generatorResult.valuevalue)
        .then(step.bind(null, "next"))
        .catch(step.bind(null, "throw"));
    };
    step();
  });
}
asyncToGenerator(testG).then(res => console.log(res));
