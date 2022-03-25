/**二分搜索 */
const search = (arr, target) => {
  arr.sort((a, b) => b - a);
  let l = 0;
  let r = arr.length - 1;
  while (r >= l) {
    let mid = Math.floor((l + r) / 2);
    console.log(r, mid, l);
    if (arr[mid] > target) {
      r = mid - 1;
    } else if (arr[mid] < target) {
      l = mid + 1;
    } else {
      return mid;
    }
  }
  return -1;
};

search([1, 2, 3, 4, 5], 30);

/** PromiseAll */
const PromiseAll = arrAsync => {
  return new Promise((reslove, reject) => {
    let arr = [];
    if (!arrAsync.length) reslove([]);
    for (let i = 0; i < arrAsync.length; i++) {
      Promise.resolve(arrAsync[i])
        .then(res => (arr[i] = res))
        .catch(res => reject(res));
    }
    reslove(arr);
  });
};

/** PromiseRace */
function promiseRace(arr) {
  return new Promise((resolve, reject) => {
    arr.forEach(i =>
      Promise.resolve(i)
        .then(res => resolve(res))
        .catch(err => reject(err))
    );
  });
}
/**异步队列 */

const queue = list => ctx => {
  let func = idx => {
    if (!list[idx]) return Promise.resolve();
    Promise.resolve(list[idx](ctx, func.bind(null, idx + 1)));
  };
  func(0);
};

/**深拷贝 */

function clone(target, map = new WeakMap()) {
  if (typeof target === "object") {
    let cloneTarget = Array.isArray(target) ? [] : {};
    if (map.get(target)) {
      return map.get(target);
    }
    map.set(target, cloneTarget);
    for (const key in target) {
      cloneTarget[key] = clone(target[key], map);
    }
    return map.get(target);
  } else {
    return target;
  }
}

/**最长不重复字符串 */

const calStr = str => {
  let res = "";
  let num = 0;
  let i = 0;
  while (i < str.length) {
    num = Math.max(res.length, num);
    if (res.includes(str[i])) {
      res = res.slice(1);
    } else {
      res += str[i];
      i++;
    }
  }
  return { num, res };
};

/**二叉树 */
const dfs = (tree, value = []) => {
  if (!tree.val) return;
  value.push(tree.val);
  if (tree.left) dfs(tree.left, value);
  if (tree.right) dfs(tree.right, value);
  return value;
};

const reDfs = root => {
  let res = [];
  let stack = [root];
  while (stack.length) {
    let init = stack.pop();
    if (init.val) res.push(init.val);
    if (init.right) stack.push(init.right);
    if (init.left) stack.push(init.left);
  }
  return res;
};

/**收集发布 */

const EventsControl = () => {
  let obj = {};
  let emit = (key, fn) => {
    (obj[key] = []).push(fn);
    console.log(obj);
  };
  let on = (key, ...arg) => {
    console.log(obj);
    if (!obj[key]) return;
    obj[key].forEach(i => i(...arg));
  };
  return { emit, on, obj };
};

/**防抖 */
const debounce = (fn, wait) => {
  let _ = "";
  return (...arg) => {
    clearTimeout(_);
    _ = setTimeout(() => {
      fn.apply(this, arg);
    }, wait);
  };
};

async function asyncPool(poolLimit, iterable, iteratorFn) {
  // 用于保存所有异步请求
  const ret = [];
  // 用户保存正在进行的请求
  const executing = new Set();
  for (const item of iterable) {
    // 构造出请求 Promise
    const p = Promise.resolve().then(() => iteratorFn(item, iterable));
    ret.push(p);
    executing.add(p);
    // 请求执行结束后从正在进行的数组中移除
    const clean = () => executing.delete(p);
    p.then(clean).catch(clean);
    // 如果正在执行的请求数大于并发数，就使用 Promise.race 等待一个最快执行完的请求
    if (executing.size >= poolLimit) {
      await Promise.race(executing);
    }
  }
  // 返回所有结果
  return Promise.all(ret);
}

// 使用方法
const timeout = i => new Promise(resolve => setTimeout(resolve(i), i));
asyncPool(2, [1000, 5000, 3000, 2000], timeout).then(results => {
  console.log(results);
});
