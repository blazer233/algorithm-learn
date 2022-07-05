/**二分搜索 */
function search(arr, key) {
  arr.sort((a, b) => a - b);
  let [l, r] = [0, nums.length - 1];
  while (l <= r) {
    var mid = Math.floor((r + l) / 2);
    if (arr[mid] > key) r = mid - 1;
    if (arr[mid] < key) l = mid + 1;
    if (key == arr[mid]) return mid;
  }
  return -1;
}
/**
 * https://leetcode.cn/problems/que-shi-de-shu-zi-lcof/
 * n-1中缺失的数字
 */
const missingNumber = function (nums) {
  let [l, r] = [0, nums.length - 1];
  while (l <= r) {
    let mid = Math.floor((l + r) / 2);
    if (nums[mid] == mid) {
      //说明小于mide的是不缺少的
      l = mid + 1;
    } else if (mid < nums[mid]) {
      r = mid - 1;
    }
  }
  return l;
};

/**最长不重复字符串 */

var lengthOfLongestSubstring = str => {
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
var lengthOfLongestSubstring = function (s) {
  let map = new Map(),
    max = 0;
  for (let i = 0, j = 0; j < s.length; j++) {
    if (map.has(s[j])) {
      i = Math.max(map.get(s[j]) + 1, i);
    }
    max = Math.max(max, j - i + 1);
    map.set(s[j], j);
  }
  return max;
};

//数组中的第K个最大元素
var findKthLargest = function (nums, k) {
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < nums.length - i - 1; j++) {
      if (nums[j] > nums[j + 1]) {
        [nums[j + 1], nums[j]] = [nums[j], nums[j + 1]];
      }
    }
  }
  console.log(nums);
  return nums[nums.length - k];
};

// 实现new
const myNew = (fn, arg) => {
  const tmp = {};
  Object.setPrototypeOf(tmp, fn.prototype);
  fn.apply(tmp, arg);
  return tmp;
};
// 实现call
Function.prototype.myCall = function (...rest) {
  let tmp = rest[0] || window;
  let args = rest.slice(1);
  tmp._self = this;
  return tmp._self(...args);
};

// 实现bind
Function.prototype.myBind = function (...rest) {
  let tmp = rest[0] || window;
  let args = rest.slice(1);
  let self = this;
  return (...rests) => self.call(tmp, [...args, ...rests.slice(1)]);
};

function myInstanceof(obj, fn) {
  while (true) {
    if (obj.__proto__ === fn.prototype) return true;
    if (obj.__proto__ === null) return false;
    obj = obj.__proto__;
  }
}
// 数组面积
const maxArea = height => {
  let [m, n] = [0, height.length - 1];
  let maxArea = 0;
  // 若m=n，则面积为0，所以不取等于
  while (m < n) {
    // 当前有效面积的高
    const h = Math.min(height[m], height[n]);
    // 当前面积
    const area = (n - m) * h;
    // 更新最大面积
    maxArea = Math.max(maxArea, area);
    // 更新指针
    if (height[m] < height[n]) {
      // 左指针对应的值小，左指针右移
      m++;
    } else {
      // 右指针对应的值小，右指针左移
      n--;
    }
  }
  return maxArea;
};

var isValid = function (s) {
  let map = {
    "{": "}",
    "(": ")",
    "[": "]",
  };
  let stack = [];
  for (let i of s) {
    if (map[i]) {
      stack.push(i);
      continue;
    }
    if (map[stack.pop()] !== i) return false;
  }
  return stack.length === 0;
};

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

/** PromiseAllSettled  */
const PromiseAllSettled = arrAsync => {
  return new Promise(reslove => {
    let arr = [];
    if (!arrAsync.length) reslove([]);
    for (let i = 0; i < arrAsync.length; i++) {
      Promise.resolve(arrAsync[i])
        .then(res => (arr[i] = { status: "fulfilled", value: res }))
        .catch(res => (arr[i] = { status: "rejected", reason: res }));
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
/**
 * 跳跃游戏
 * https://leetcode.cn/problems/jump-game/
1. 使用一个变量保存当前可到达的最大位置
2. 时刻更新最大位置
3. 可达位置小于数组长度返回false，反之即反
 */
var canJump = function (nums) {
  let k = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > k) return false;
    k = Math.max(k, i + nums[i]);
  }
  return true;
};

/**深拷贝 */

function deepClone1(target, map = new WeakMap()) {
  if (obj instanceof RegExp) return new RegExp(obj);
  if (obj instanceof Date) return new Date(obj);
  if (obj == null || typeof obj != "object") return obj;
  let cloneTarget = Array.isArray(target) ? [] : {};
  if (map.get(target)) {
    return map.get(target);
  }
  map.set(target, cloneTarget);
  for (const key in target) {
    cloneTarget[key] = clone(target[key], map);
  }
  return map.get(target);
}

const deepClone2 = obj => {
  return new Promise(res => {
    let { port1, port2 } = new MessageChannel();
    port1.postMessage(obj);
    port2.onmessage = e => res(e.data);
  });
};
deepClone({ a: 123 }).then(res => console.log(res));

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

class PubSub {
  constructor() {
    this.events = {};
  }
  subscribe(type, cb) {
    this.events[type] = this.events[type] || new Set();
    this.events[type].add(cb);
  }
  publish(type, ...args) {
    this.events[type] && this.events[type].forEach(cb => cb(...args));
  }
  unsubscribe(type, cb) {
    if (this.events[type]) {
      this.events[type].delete(cb);
      if (!this.events[type].size) this.unsubscribeAll(type);
    }
  }
  unsubscribeAll(type) {
    if (this.events[type]) delete this.events[type];
  }
}

/**异步队列 */

const queue = list => ctx => {
  let func = idx => {
    if (!list[idx]) return Promise.resolve();
    Promise.resolve(list[idx](ctx, func.bind(null, idx + 1)));
  };
  func(0);
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

//最长连续不重复字符串
var calStr = str => {
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

// 螺旋矩阵
var spiralOrder = function (matrix) {
  if (matrix.length == 0) return [];
  const res = [];
  let top = 0,
    bottom = matrix.length - 1,
    left = 0,
    right = matrix[0].length - 1;
  while (top <= bottom && left <= right) {
    //循环条件
    for (let i = left; i <= right; i++) res.push(matrix[top][i]); //循环完上面一行 top++
    top++;
    for (let i = top; i <= bottom; i++) res.push(matrix[i][right]); //循环右边一行 right--
    right--;
    if (top > bottom || left > right) break;
    for (let i = right; i >= left; i--) res.push(matrix[bottom][i]);
    bottom--;
    for (let i = bottom; i >= top; i--) res.push(matrix[i][left]);
    left++;
  }
  return res;
};
// 螺旋矩阵
var spiraltestOrder = function (matrix) {
  const res = [];
  let top = 0,
    bottom = matrix.length - 1,
    left = 0,
    right = matrix[0].length - 1;
  // debugger
  for (let i = top; i < right; i++) res.push(matrix[top][i]);
  for (let i = top; i < bottom; i++) res.push(matrix[i][right]);
  for (let i = right; i > left; i--) res.push(matrix[bottom][i]);
  for (let i = bottom; i > top; i--) res.push(matrix[i][left]);
  return res;
};
console.log(
  spiraltestOrder([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ])
);

// 实现防止重复发送请求
const firstPromise =
  (fn, p = null) =>
  (...arg) =>
    p ? p : (p = fn(...arg).finally(() => (p = null)));
var arr = [
  { id: 6, name: "部门1", pid: 0 },
  { id: 1, name: "部门1", pid: 0 },
  { id: 2, name: "部门2", pid: 1 },
  { id: 3, name: "部门3", pid: 1 },
  { id: 4, name: "部门4", pid: 3 },
  { id: 5, name: "部门5", pid: 4 },
];
function dataTotree(arr) {
  const res = [];
  const map = {};
  for (let i of arr) map[i.id] = { ...i, child: [] };
  for (let i of arr) {
    let item = map[i.id];
    if (i.pid == 0) {
      res.push(item);
    } else {
      map[i.pid].child.push(item);
    }
  }
  return res;
}
console.log(dataTotree(arr));
