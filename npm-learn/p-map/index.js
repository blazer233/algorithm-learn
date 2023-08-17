const pin = require("./core");
const pinbase = require("./base");
const arrId = Array.from({ length: 5 }, (i, d) => (i = d));
const request = id => {
  return new Promise(resolve => {
    //随机一个执行时间
    let time = Math.floor(10000 * Math.random());
    console.log(`id为${id}开始请求,预计执行时间${time / 1000}`);
    setTimeout(() => resolve(id), time);
  }).then(id => {
    console.log(`id为${id}的请求进行逻辑处理`);
    return `${id}_over`;
  });
};

pinbase(arrId)
  .map(async i => await request(i))
  .then(res => console.log(res));
