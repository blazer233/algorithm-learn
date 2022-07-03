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
