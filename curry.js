const curry = fn =>
  (judge =
    (...arg) =>
    (...args) =>
      !args.length ? fn(...arg) : judge(...arg, ...args));

const currySum = curry_(function (...args) {
  return args.reduce((a, b) => a + b, 0);
});
console.log(curry_fn(2, 1)(3)(4)(), "有限参数柯理化");

function adder() {
  var arg = Array.from(arguments);
  return function () {
    var args = Array.from(arguments);
    if (args.length == 0) {
      return arg.reduce((a, b) => a + b, 0);
    } else {
      return adder(...args, ...arg);
    }
  };
}
const compose_3 = (...args) =>
  args.reverse().reduce(
    (itemFn, allargs) =>
      (...arg) =>
        allargs(itemFn(arg)),
    args.shift()
  );

const compose_3_ = function (...args) {
  if (args.length === 0) return arg => arg; //返回接受参数的第一个参数如：
  /*
            if (args.length === 0) {
            	return function(arg) {
            		return arg
            	}
            }
            */
  if (args.length === 1) return args[0]; //存在一个函数则返回接受的函数并执行
  let arg = args.reverse();
  return args.reduce((item, callback) => {
    console.log(callback);
    return function (...arg_) {
      return callback(item(...arg_));
    };
  }, args.shift());
};

let compose = (...funcs) => {
  if (funcs.length === 0) return arg => arg;
  if (funcs.length === 1) return funcs[0];
  return funcs.reduce(
    (a, b) =>
      (...args) =>
        a(b(...args))
  );
};

function composes(...funcs) {
  if (funcs.length === 0) return arg => arg;
  if (funcs.length === 1) return funcs[0];
  return funcs.reduce((itemFn, callback) => {
    console.log(callback);
    return function (...args) {
      return itemFn(callback(...args));
    };
  });
}

let compose_my = function (...func) {
  //如果没有函数，则返回compose_my函数中第一个参数
  if (func.length == 0) {
    return function (arg) {
      return arg;
    };
  }
  //如果只有一个函数，则返回返回这个函数
  if (func.length == 1) {
    return func[0];
  }
  //返回reduce处理的结果
  return func.reduce((itemFn, callback) => {
    //初始callback为第一个函数即 greeting()
    return function (...arg) {
      //arg为接受处理函数返回的最终函数的参数 即'jack', 'smith', 'wang'
      return itemFn(callback(...arg));
      //第一个函数接受多个参数，返回一个值被下一个函数作为参数，最终输出
    };
  });
};
let compose_1 = (...args) => {
  var len = args.length; // 记录我们传入所有函数的个数
  var count = len - 1; // 游标记录函数执行情况, 也作为我们运行中函数的索引
  var result; // 结果, 每次函数执行完成后, 向下传递
  return function f1(...arg) {
    //arg为接受处理函数返回的最终函数的参数 即'jack', 'smith', 'wang'
    result = args[count](...arg);
    if (count <= 0) {
      //只有一个函数时
      count = len - 1;
      return result;
    } else {
      //多个函数时，游标移动，递归执行
      count--;
      return f1(result);
    }
  };
};

var composess = function (...fns) {
  var len = fns.length; // 记录我们传入所有函数的个数
  var index = len - 1; // 游标记录函数执行情况, 也作为我们运行fns中的中函数的索引
  var reslut; // 结果, 每次函数执行完成后, 向下传递
  return function f1(...arg1) {
    reslut = fns[index].apply(this, arg1);
    if (index <= 0) {
      index = len - 1; // 再看这篇文章的时候, 不清楚这里处理index的作用
      return reslut;
    } else {
      --index;
      return f1.call(null, reslut);
    }
  };
};
var greeting = (...arg) => "hello, " + arg.join(" ");
var toUpper = str => str.toUpperCase();
var timing = str => `${str}  time= ${+new Date()}`;
var fn = compose_1(timing, toUpper, greeting);
console.log(fn("jack", "smith", "wang"));
/*
            从右向左以此执行，且上一个函数的执行结果作为下一个函数的参数
            第一个函数是多元的（接受多个参数），后面的函数都是单元的（接受一个参数）
            所有函数的执行都是同步的*/
