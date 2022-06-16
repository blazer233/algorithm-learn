class Scheduler {
  constructor() {
    this.exe1 = "";
    this.exe2 = "";
  }
  async add(fn) {
    if (!this.exe1) {
      this.exe1 = fn;
      return this.exe1().then(_ => (this.exe1 = null));
    } else if (!this.exe2) {
      this.exe2 = fn;
      return this.exe2().then(_ => (this.exe2 = null));
    } else {
      console.log(fn, 33);
      try {
        return await Promise.race([this.exe1(), this.exe2()]);
      } finally {
        await this.add(fn);
      }
    }
  }
}
class Scheduler {
  constructor() {
    this.count = 0; // 记录当前已被启动的promise
    this.queue = []; // 记录promise的数组
    this.allqueue = [];
  }
  add(task) {
    // 单纯存储promise
    this.allqueue.push(task);
    return new Promise(resolve => {
      this.queue.push([task, resolve]); // 关键，将 resolve 方法存入数组，执行任务后再调用
      this.run();
    });
  }
  run() {
    // 假设pending为空，或者调用大于限制直接返回
    // 顺序取任务进行执行,索引递增
    // 任务执行完之后。索引递减，执行下一任务
    if (this.count >= 2 || !this.queue.length) return;
    const [task, resolve] = this.queue.shift();
    this.count++;
    task()
      .then(res => resolve(res))
      .finally(() => {
        this.count--;
        this.run();
      });
  }
}
const timeOut = time =>
  new Promise(resolve =>
    setTimeout(() => {
      resolve(time);
    }, time)
  );
const scheduler = new Scheduler();
const addTask = (time, order) => {
  scheduler.add(() => timeOut(time)).then(time => console.log(order, time));
};
addTask(1000, "1");
addTask(500, "2");
addTask(300, "3");
addTask(400, "4");

//https://www.cnblogs.com/echolun/p/15906939.html
