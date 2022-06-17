class Scheduler {
  constructor() {
    this.queue = [];
  }
  async add(fn) {
    if (this.queue.length >= 2) {
      return Promise.race(this.queue).then(() => this.add(fn));
    }
    let task = fn();
    const del = () => this.queue.splice(this.queue.indexOf(fn), 1);
    let rt = task.then(del);
    this.queue.push(rt);
    return rt;
  }
}
