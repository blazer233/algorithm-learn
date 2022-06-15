class Scheduler {
  constructor() {
    // 所有的任务队列，存放的是函数
    this.allQueue = [];
    // 正在执行的任务队列,存放的是Promise
    this.queue = [];
  }
  // 接受一个函数，执行之后是得到一个Promise，并且本身也返回一个Promise
  add(fn) {
    this.allQueue.push(fn);
    return this.run(fn);
  }
  run(fn) {
    if (this.queue.length >= 2) {
      return new Promise(resolve => {
        fn.resolve = resolve;
      });
    } else {
      this.queue.push(fn);
      return fn()
        .then(res => {
          fn.resolve && fn.resolve(res);
          return res;
        })
        .finally(() => {
          let queueIndex = this.queue.indexOf(fn);
          let curallQueueIndex = this.allQueue.indexOf(fn);
          let nextfn;
          // 待执行任务队列
          if (curallQueueIndex !== -1) {
            nextfn = this.allQueue[curallQueueIndex + 1];
          }
          // 正在执行的任务队列
          if (queueIndex !== -1) {
            // 执行完后出队列，并进行下一个任务
            this.queue.splice(queueIndex, 1);
            if (nextfn) {
              this.run(nextfn);
            }
          }
        });
    }
  }
}
class Scheduler {
  //关键点为 Promise 没有被 resolve 或 reject 时后面代码会被暂停，Promise 的 resolve 或 reject 可以在Promise构造函数外执行
  constructor() {
    this.awaitArr = [];
    this.count = 0;
  }
  async add(fn) {
    if (this.count >= 2) {
      //当前执行并发大于等于2时，生成一个暂停的Promise，把resolve添到一个数组中，下面的代码被暂停执行
      await new Promise(resolve => this.awaitArr.push(resolve));
    }
    //当前执行并发小于2, 立即执行异步操作
    this.count++;
    const res = await fn();
    this.count--;
    //异步操作执行完毕后从数组中弹出最先push的resolve改变Promise的状态
    if (this.awaitArr.length) this.awaitArr.shift()();
    //由于Promise被resolve了，最初被暂停的代码可以继续执行
    return res;
  }
}
class Scheduler {
  constructor() {
    this.list = [];
    this.cur = 0;
  }
  async next() {
    this.cur++;
    await this.list.shift()();
    this.cur--;
    if (this.list.length > 0) this.next();
  }
  add(fn) {
    return new Promise(resolve => {
      let mid = () => fn().then(resolve);
      this.list.push(mid);
      if (this.cur < 2) {
        this.next();
      }
    });
  }
}
class Scheduler {
  constructor() {
    this.queue = [];
  }
  async add(fn) {
    if (this.queue.length >= 2) {
      return Promise.race(this.queue).then(() => this.add(fn));
    }
    let task = fn();
    let curIndex = this.queue.indexOf(fn);
    let rt = task.then(() => this.queue.splice(curIndex, 1));
    this.queue.push(rt);
    return rt;
  }
}
