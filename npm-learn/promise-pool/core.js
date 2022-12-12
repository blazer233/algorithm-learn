const request1 = id => {
  return new Promise(resolve => {
    //随机一个执行时间
    let time = Math.floor(10000 * Math.random());
    console.log(`id为${id}开始请求,预计执行时间${time / 1000}`);
    setTimeout(() => resolve(id), time);
  }).then(id => {
    console.log(`id为${id}的请求进行逻辑处理`);
    return id;
  });
};
const request2 = (arg, t = 1000) => new Promise(res => setTimeout(res, t, arg));
/**
 * 并发分为两种模式
 *  1、已知请求并发数
 *     1、建立执行数组
 *     2、同步遍历请求数组，同步添加异步方法到执行数组中
 *     3、如果当前请求执行完则删除执行数组中对应方法
 *     4、一旦数组长度到限额长度，则选取数组中最快结束的方法进行执行
 *
 *  2、未知请求并发数
 *     1、通过闭包返回 Promise函数 并将需要执行的 请求 以及对应的 resolve 、reject 方法依次保存到数组中
 *     2、设置索引，记录执行的函数的数目
 *     3、声明 run 函数，对数组中的函数递归执行，如果数组中的函数不存在 或者 执行的函数个数超过限额 则退出
 *     4、依次取出数组中保存的函数，以及对应的 resolve 、reject
 *     5、索引递增，执行每一个函数，执行完之后索引递减，当每个函数执行完，使用对应的 resolve 、reject 进行暴露，递归执行
 *
 */

/**已知并发个数类型： ********************************************************************************/

let idArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const asyncPool = async (arr, iteratorFn = request, limit = 3) => {
  try {
    let exec = new Set();
    for (let i of arr) {
      const task = iteratorFn(i);
      exec.add(task);
      task.finally(() => exec.delete(task));
      if (exec.size >= limit) {
        await Promise.race(exec);
      }
    }
  } catch (e) {
    console.error(e);
  }
};
asyncPool(idArray, request1, 3);

/**未知并发个数类型： ********************************************************************************/

const Scheduler2 = (ajax = request2, limit = 3) => {
  const queue = [];
  let idx = 0;
  const run = () => {
    if (!queue.length || idx == limit) return;
    const [param, reslove, reject] = queue.shift();
    idx += 1;
    ajax(param).then(reslove).catch(reject).finally(() => {
      idx -= 1;
      run();
    });
  };
  return arg => new Promise((res, rej) => {
    queue.push([arg, res, rej]);
    run();
  });
};
const createPromise = Scheduler2();
createPromise(1).then(res => console.log(res));
createPromise(2).then(res => console.log(res));
createPromise(3).then(res => console.log(res));
createPromise(4).then(res => console.log(res));

/**未知并发个数类型：class实现 *************************************************************************/

class Scheduler {
  constructor() {
    this.limit = 2;
    this.queue = [];
    this.idx = 0;
  }
  add(fn) {
    return new Promise((reslove, reject) => {
      this.queue.push([fn, reslove, reject]);
      this.run();
    });
  }
  run() {
    if (!this.queue.length || this.idx >= this.limit) return;
    const [task, resolve, reject] = this.queue.shift();
    this.idx++;
    task().then(resolve).catch(reject).finally(() => {
      this.idx--;
      this.run();
    });
  }
}
const scheduler = new Scheduler();
const addTask = (time, order) => {
  scheduler.add(() => request2(time).then(() => console.log(order)));
};
addTask(1000, "1");
addTask(500, "2");
addTask(300, "3");
addTask(400, "4");