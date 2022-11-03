const START = 0;
const DATA = 1;
const END = 2;
const pipe = (source, ...callbacks) =>
  callbacks.reduce((prev, cb) => cb(prev), source);

// 接受一个 iter 作为入参，返回 source sink
// 这个 source sink 接受的第二个参数 payload 是个 sink，看清楚结构哦~
// payload 为 sink 原因是，你总得给 from operator 把数据传出去的机会吧，这里面都是用 sink 通信，那就传 sink 咯
const from = iter => (type, sink) => {
  // 如果 listener 不先传 0，source 没有nuan用
  if (type !== START) return;

  // 偷懒简单实现，更通用的方式是利用 iterator
  if (Array.isArray(iter)) {
    const len = iter.length;
    let inLoop = true;
    let i = 0;

    // 数据准备好了，既然是 sink 嘛，那还得先建立通信咯
    sink(START, t => {
      if (i === len) return;
      // 静候 type 1 的到来，传出数据
      if (t === DATA) {
        sink(DATA, { v: iter[i], i: i++, o: iter });
        if (i === len && inLoop) {
          inLoop = false;
          // 遍历完了断开通信
          sink(END);
        }
      }
      // listener 主动断开连接
      if (t === END) sink(END);
    });
  }
};
const map = (callback, thisArg) => source => (type, sink) => {
  if (type !== START) return;
  let i = 0;

  // 数据准备好了，与 source 建立通信
  source(START, (t, d) => {
    // 静候 type 1 的到来，执行用户层面的 callback 并传出
    sink(t, t === DATA ? callback.call(thisArg, d.v, i++, d.o) : d);
  });
};
const each = (callback, thisArg) => source => {
  let pullable;
  let i = 0;

  // 建立通信
  source(START, (t, d) => {
    // source 收到 listener 的 type 0 后，将内部的 sink 传出来给 listener 使用
    if (t === START) pullable = d;
    // 收到 source 返回数据，执行用户逻辑
    if (t === DATA) callback.call(thisArg, d, i++);
    // 数据遍历完了，结束
    if (t === END) pullable = null;

    // 收到 0 或 1，开始消费 source
    if (t !== END) pullable(DATA);
  });
};
const source = pipe(
  from([3, 5, 8]),
  map((n, i) => n + "-map-" + i)
);

each(console.log)(source);
