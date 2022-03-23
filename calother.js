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
let value = [];

const dfss = tree => {
  if (!tree.value) return;
  value.push(tree.value);
  if (tree.left) dfss(tree.left);
  if (tree.right) dfss(tree.right);
};

const dfs = tree => {
  let res = [];
  let stack = [];
  stack.push(tree);
  while (stack.length) {
    let one = stack.pop();
    res.push(one.value);
    if (one.left) stack.push(one.left);
    if (one.right) stack.push(one.right);
  }
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
