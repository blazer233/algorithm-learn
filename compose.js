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

//洋葱模型指 以 next() 函数为分割点，先由外到内执行
//首次执行时传入 0 在dispatch中执行，函数执行中遇到 next 函数
//即执行 dispatch 函数 dispatch.bind(null, i + 1) 进行递归，索引自增，即执行下一个中间件函数
//当所以中间件函数执行结束，返回Promise.resolve() 从里到外执行回调函数

//next 即 stack 中下一个函数
const koaCompose =
  stack =>
  (ctx = {}) => {
    const dispatch = idx => {
      return stack[idx] && stack[idx](ctx, dispatch.bind(null, idx + 1));
    };
    return dispatch(0);
  };
let mw1 = (ctx, next) => {
  ctx.next1 = "第一个中间件";
  console.log("next前,第一个中间件");
  next("info");
  console.log("next后,第一个中间件");
};
let mw2 = (ctx, next) => {
  console.log("next前,第二个中间件");
  ctx.next2 = "第二个中间件";
  next();
  console.log("next后,第二个中间件");
};
let mw3 = (ctx, next) => {
  ctx.next3 = "第三个中间件";
  console.log("第三个中间件,没有next了");
  next();
};

let show = (ctx, next) => {
  console.log(ctx, next, 909);
};

const middlewares = [mw1, mw2, mw3, show];
const fn = koaCompose(middlewares);

fn();

/**********************************************redux 中间件 ***********/

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
      dispatch: (...args) => dispatch(...args),
    };
    chain = middlewares.map(middleware => middleware(middlewareAPI));
    dispatch = compose(...chain)(store.dispatch);
    return {
      ...store,
      dispatch,
    };
  };
export default function applyMiddleware(...middlewares) {
  return createStore =>
    (...args) => {
      const store = createStore(...args);
      const middlewareAPI = {
        getState: store.getState,
        dispatch: (...args) => dispatch(...args),
      };
      const chain = middlewares.map(middleware => middleware(middlewareAPI));
      dispatch = compose(...chain)(store.dispatch);

      return {
        ...store,
        dispatch,
      };
    };
}
