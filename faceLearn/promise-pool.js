let request = id => {
  return new Promise(resolve => {
    //随机一个执行时间
    let time = Math.floor(10000 * Math.random());
    console.log(`id为${id}开始请求,预计执行时间${time / 1000}`);
    setTimeout(() => {
      resolve(id);
    }, time);
  }).then(id => {
    console.log(`id为${id}的请求进行逻辑处理`);
    return id;
  });
};
let idArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const asyncPool = async (arr, iteratorFn, limit) => {
  let exec = new Set();
  for (let i of arr) {
    const task = iteratorFn(i);
    const del = res => {
      console.log(`id${res}的请求已经处理完毕,当前并发${exec.size}`);
      exec.delete(task); //每跑完一个任务,从并发池删除个任务
    };
    exec.add(task);
    task.then(del).catch(del);
    if (exec.size >= limit) {
      //使用await进行阻塞,最快的执行之后才能继续循环
      await Promise.race(exec);
    }
  }
};

asyncPool(idArray, request, 3);
