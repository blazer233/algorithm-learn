class PInstance {
  constructor(items = []) {
    this.items = items;
  }
  map(fn) {
    return new PInstance(this.items.map((i, idx) => fn(i, idx)));
  }
  then(fn) {
    // 通过 Promise.all 控制输出的顺序
    return fn ? Promise.all(this.items).then(fn) : Promise.all(this.items);
  }
}
module.exports = arr => new PInstance(arr);
