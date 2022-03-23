/**
 * 跨域：
    1、 通过jsonp跨域
    2、 document.domain + iframe跨域
    3、 location.hash + iframe跨域
    4、 window.name + iframe跨域
    5、 postMessage跨域
    6、 跨域资源共享（CORS）
    7、 nginx代理跨域
    8、 nodejs中间件代理跨域
    9、 WebSocket协议跨域
 */

const clone = (obj, m = new WeakMap()) => {
  let _obj = Array.isArray(obj) ? [] : {};
  if (m.get(obj)) return m.get(obj);
  m.set(obj, _obj);
  for (let i in obj) {
    _obj[i] = clone(obj[i], m);
  }
  return _obj;
};
/**
 * 递归二叉树
 *
 * 深度优先遍历
 *
 * 递归法：
 *  1、如果节点存在，将节点value放到result中，否则终止
 *  2、对节点的right、left进行递归
 *
 * 栈存储：
 *  1、将当前节点放入栈中，对栈进行循环
 *  2、从栈中取出，将节点value放到result，如果节点的left和right存在，将节点的子节点放到栈中继续循环
 */
var tree = {
  value: 1,
  left: {
    value: 2,
    left: {
      value: 3
    },
    right: {
      value: 4,
      left: {
        value: 5
      },
      right: {
        value: 6
      }
    }
  },
  right: {
    value: 7,
    left: {
      value: 8
    },
    right: {
      value: 9
    }
  }
};
let result = [];
let dfs_ = function (node) {
  if (node) {
    result.push(node.value);
    dfs(node.left);
    dfs(node.right);
  }
};

const dfs = node => {
  let stack = [];
  let res = [];
  stack.push(node);
  while (stack.length) {
    let _node = stack.pop();
    res.push(_node.value);
    if (_node.left) stack.push(_node.left);
    if (_node.right) stack.push(_node.right);
  }
  return res;
};
console.log(dfs(tree));
/********** 通用方法 **********/
const bfs = (node, isdeep) => {
  const res = [];
  const stack = [];
  stack.push(node);
  while (stack.length) {
    let _node = stack[isdeep ? "pop" : "shift"]();
    res.push(_node.value);
    if (_node.right) stack.push(_node.right);
    if (_node.left) stack.push(_node.left);
  }
  return res;
};
/******** 反转二叉树 ********/
const interTree = node => {
  if (node == null) return null;
  const right = interTree(node.right);
  const left = interTree(node.left);
  node.right = left;
  node.left = right;
  return node;
};

var invertTree = function (root) {
  if (!root) return null;
  const stack = [];
  stack.push(root);
  while (stack.length) {
    let top = stack.shift();
    // 交换节点top的左右孩子
    [top.left, top.right] = [top.right, top.left];
    // 如果下面这层依旧有孩子节点，则加入到队列中
    if (top.left) stack.push(top.left);
    if (top.right) stack.push(top.right);
  }
  return root;
};

/******************* 二叉树最右边 *************/

var rightSideView = function (root) {
  if (!root) return [];
  const queue = [];
  const arrRS = [];
  // 先保存根结点，也就是第一层二叉树
  queue.push(root);
  while (queue.length) {
    // 将队列长度先保存到一个变量里面
    // 表示的是上一层的节点的数量
    let temp = null;
    let length = queue.length;
    // 遍历上一层节点，将它们的子节点加入队列中，收集得到二叉树的下一层
    for (let i = 0; i < length; i++) {
      // 出队列，并获得返回的父节点
      const node = queue.shift();
      // 每次都用当前节点的val覆盖temp
      // temp最后会等于当前层最右的一个非空节点的val值
      if (node.value) temp = node.value;
      // 收集当前节点的左节点和右节点，从而得到下一层
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    // 收集每一层的最右节点
    arrRS.push(temp);
  }
  return arrRS;
};

/**************** 二叉树路径 **************/
//dfs 算法
var binaryTreePaths = function (root) {
  if (!root) return [];
  const ans = [];
  const dfs = (node, path) => {
    if (!node) return;
    if (!node.left && !node.right) {
      ans.push([...path, node.value].join(" > "));
      return;
    }
    dfs(node.left, [...path, node.value]);
    dfs(node.right, [...path, node.value]);
  };
  dfs(root, []);
  return ans;
};
// console.log(binaryTreePaths(tree));
var binaryTreePathsSimple = function (root) {
  if (!root) return [];
  if (!root.left && !root.right) return [root.value];
  let left = binaryTreePathsSimple(root.left);
  let right = binaryTreePathsSimple(root.right);
  return [...left, ...right].map(item => root.value + " > " + item);
};
console.log(binaryTreePathsSimple(tree));
//回溯算法
var binaryTreePaths3 = function (root) {
  let res = [];
  let cur = [];
  preOrder(root);
  function preOrder(node) {
    if (node) {
      cur.push(node.value);
      if (!node.left && !node.right) {
        res.push(cur.join(" > "));
        cur.pop();
        return;
      }
      preOrder(node.left);
      preOrder(node.right);
      // 回溯
      cur.pop();
    }
  }
  return res;
};
console.log(binaryTreePaths3(tree));
/********************************************************/

function new_(fn, arg) {
  let obj = {};
  Object.getPrototypeOf(obj, fn.prototype);
  fn.apply(obj, arg);
  return obj;
}

const debounce = (fn, wait) => {
  let _ = "";
  return (...arg) => {
    clearTimeout(_);
    _ = setTimeout(() => {
      fn.apply(this, arg);
    }, wait);
  };
};

class PubSub {
  constructor() {
    this.events = {};
  }
  subscribe(type, cb) {
    (this.events[type] = []).push(cb);
  }
  publish(type, ...args) {
    this.events[type] && this.events[type].forEach(cb => cb(...args));
  }
  unsubscribe(type, cb) {
    if (this.events[type]) {
      const targetIndex = this.events[type].findIndex(item => item === cb);
      if (targetIndex > -1) this.events[type].splice(targetIndex, 1);
      if (this.events[type].length === 0) this.unsubscribeAll(type);
    }
  }
  unsubscribeAll(type) {
    if (this.events[type]) {
      delete this.events[type];
    }
  }
}

let search = (arr, target) => {
  try {
    let l = 0;
    let r = arr.length - 1;
    while (r >= l) {
      let mid = Math.floor(arr.length / 2) + l;
      if (arr[mid] > target) l = mid + 1;
      if (arr[mid] < target) r = mid - 1;
      if (arr[mid] == target) return mid;
    }
    return -1;
  } catch (error) {
    console.log(error);
  }
};

var mappingRoman = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
  IV: 4,
  IX: 9,
  XL: 40,
  XC: 90,
  CD: 400,
  CM: 900
};
let tran = str => {
  let k = "";
  for (let i = 0; i < str.length; i++) {
    let ss = `${str[i]}${str[i + 1]}`;
    if (mappingRoman[ss]) {
      k += mappingRoman[ss];
      i++;
    } else {
      k += mappingRoman[str[i]];
    }
  }
};
tran("MCMXCIV");
// const mySetTimeout = (cb, t) => {
//   let _date = new Date();
//   let _has = 0;
//   while (_has - _date < t) {
//     _has = new Date();
//   }
//   cb();
// };
// mySetTimeout(() => {
//   console.log(123);
// }, 5000);

const trantoUpperCase = str => {
  let [item, end] = str.split("_");
  return item + end[0].toUpperCase() + end.slice(1);
};
trantoUpperCase("sdds_sda");

/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function (s) {
  var subs = "";
  var max = 0;
  for (let i = 0; i < s.length; i++) {
    if (subs.includes(s[i])) {
      subs = subs.slice(subs.indexOf(s[i]) + 1);
    }
    subs += s[i];
    max = Math.max(max, subs.length);
  }
  return max;
};

const onlyStr = s => {
  let _str = [];
  let max = 0;
  for (let i = 0; i < s.length; i++) {
    let index = _str.indexOf(s[i]);
    if (index !== -1) {
      _str.splice(0, index + 1);
    }
    _str.push(s[i]);
    max = Math.max(_str.length, max);
  }
  return max;
};
onlyStr("pwwkew");
const commonFirst = strs => {
  let ans = "";
  for (const ch of strs[0]) {
    if (!strs.every(str => str.startsWith(ans + ch))) break;
    ans += ch;
  }
  return ans;
};
commonFirst(["flower", "flow", "flight"]);

function MinCoinChange1(coins) {
  return function (amount) {
    let total = 0,
      change = [];
    for (let i = coins.length; i >= 0; i--) {
      let coin = coins[i];
      while (total + coin <= amount) {
        change.push(coin);
        total += coin;
      }
    }
    return change;
  };
}

var lengthOfLIS = function (nums) {
  let tails = [];
  nums.forEach(num => {
    // 二分搜索：找到大于等于 num 的左侧边界，如果全小，则 left = tails.length
    let left = 0,
      right = tails.length - 1,
      mid;
    while (left <= right) {
      mid = left + parseInt((right - left) / 2);
      if (tails[mid] < num) {
        left = mid + 1;
      } else if (tails[mid] > num) {
        right = mid - 1;
      } else if (tails[mid] === num) {
        // 收缩左侧边界
        right = mid - 1;
      }
    }
    tails[left] = num;
  });
  // 调试
  // console.log(tails)
  return tails;
};
console.log(lengthOfLIS([0, 1, 0, 3, 2, 3]));
/********************************* express中间件 异步队列 ***********************s*******/

app.handle = function (req, res) {
  var stack = this.stack;
  var idx = 0;
  function next() {
    if (idx >= stack.length) return;
    while (idx < stack.length) {
      stack[(idxMinCoinChange1req, res, next)];
    }
  }
  next();
};
const queue = () => {
  let idx = 0;
  let stack = [];
  let isStop = false;
  const add = (...fn) => stack.push(...fn);
  const stop = () => (isStop = true);
  const run = () => typeof stack[idx] == "function" && stack[idx](next);
  const next = () => {
    if (idx == stack.length - 1 || isStop) return;
    stack[++idx](next); //按照数组自动执行
  };
  return { add, run, stop };
};
const koaCompose = stack => ctx => {
  const dispatch = idx => {
    if (!stack[idx]) return Promise.resolve();
    return Promise.resolve(stack[idx](ctx, dispatch.bind(null, idx + 1)));
  };
  return dispatch(0);
};

// 生成异步任务
const asyncHandle = x => {
  return next => {
    // console.log("brforn" + x);
    // next(); // 异步任务完成调用
    // console.log("after" + x);
    // 传入 next 函数
    setTimeout(() => {
      console.log("brforn" + x, next);
      next(); // 异步任务完成调用
      console.log("after" + x);
    }, 1000);
  };
};
const funs = [1, 2, 3, 4, 5, 6].map(x => asyncHandle(x));
// const q = queue();
// q.add(...funs);
// q.run(); // 1, 2, 3, 4, 5, 6 隔一秒一个。
// const q = koaCompose();
// q.add(...funs);
// q.run(); // 1, 2, 3, 4, 5, 6 隔一秒一个。
/************************************** koa中间件 *********************/
/**
 * use 方法:函数存到中间件中 this.middleware.push(fn)
 *
 * koa的思想是先经过业务路由，然后再处理中间件，
 * express的思想是先经过中间件，比如鉴权，如果中间件验证不通过，就不会处理业务了。
 * koa通过await next()来统计中间件耗时，
 * express可以在第一个中间件的时候把时间挂在到req上，
 * 等流转到业务代码的时候就可以统计中间件耗时了。
 */
//洋葱模型指 以next() 函数为分割点，先由外到内执行
//首次执行时传入 0 在dispatch中执行，函数执行中遇到 next 函数
//即执行 dispatch 函数 dispatch.bind(null, i + 1) 进行递归，索引自增，即执行下一个中间件函数
//当所以中间件函数执行结束，返回Promise.resolve() 从里到外执行回调函数
let mw1 = async function (ctx, next) {
  console.log("next前，第一个中间件");
  await next();
  console.log("next后，第一个中间件");
};
let mw2 = async function (ctx, next) {
  console.log("next前，第二个中间件");
  await next();
  console.log("next后，第二个中间件");
};
let mw3 = async function (ctx, next) {
  console.log("第三个中间件，没有next了");
};

const koaCompose = stack => ctx => {
  const dispatch = idx => {
    if (!stack[idx]) return Promise.resolve();
    return Promise.resolve(stack[idx](ctx, dispatch.bind(null, idx + 1)));
  };
  return dispatch(0);
};
export const applyMiddleware =
  (...middlewares) =>
  createStore =>
  (...args) => {
    //args即reducer, defaultstate
    var store = createStore(...args);
    var dispatch = store.dispatch;
    var chain = [];
    var middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    };
    chain = middlewares.map(middleware => middleware(middlewareAPI));
    dispatch = compose(...chain)(store.dispatch);
    return {
      ...store,
      dispatch
    };
  };
export default function applyMiddleware(...middlewares) {
  return createStore =>
    (...args) => {
      const store = createStore(...args);
      const middlewareAPI = {
        getState: store.getState,
        dispatch: (...args) => dispatch(...args)
      };
      const chain = middlewares.map(middleware => middleware(middlewareAPI));
      dispatch = compose(...chain)(store.dispatch);

      return {
        ...store,
        dispatch
      };
    };
}

const middleware = [mw1, mw2, mw3];
function compose(middleware) {
  return ctx => {
    const dispatch = i => {
      const fn = middleware[i];
      if (!fn) return Promise.resolve();
      return Promise.resolve(fn(ctx, dispatch.bind(null, i + 1)));
    };
    return dispatch(0);
  };
}
// const fn = compose(middleware);
const fn = koaCompose(middleware);

fn();
//处理并发请求
let firstPromise = (fn, p = true) => (...arg) =>  p ? p : (p = fn(...arg).finally(() => (p = null)));
  


let count = 1;
let promiseFunction = () => new Promise(rs => setTimeout(rs(count++), 1000));
let firstFn = firstPromise(promiseFunction);
firstFn().then(console.log); // 1
firstFn().then(console.log); // 1
firstFn().then(console.log); // 1

setTimeout(() => {
  firstFn().then(console.log); // 2
  firstFn().then(console.log); // 2
  firstFn().then(console.log); // 2
}, 3000);

//5、异步控制并发数

function limitRequest(urls = [], limit = 3) {
  return new Promise((resolve, reject) => {
    const len = urls.length;
    let count = 0;

    // 同时启动limit个任务
    while (limit > 0) {
      start();
      limit -= 1;
    }

    function start() {
      const url = urls.shift(); // 从数组中拿取第一个任务
      if (url) {
        axios
          .post(url)
          .then(res => {
            // todo
          })
          .catch(err => {
            // todo
          })
          .finally(() => {
            if (count == len - 1) {
              // 最后一个任务完成
              resolve();
            } else {
              // 完成之后，启动下一个任务
              count++;
              start();
            }
          });
      }
    }
  });
}

// 测试
limitRequest([
  "http://xxa",
  "http://xxb",
  "http://xxc",
  "http://xxd",
  "http://xxe"
]);
