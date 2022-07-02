/**二分搜索 */
function search(arr, key) {
  arr.sort((a, b) => a - b);
  var l = 0,
    r = arr.length - 1;
  while (l <= r) {
    var mid = Math.floor((r + l) / 2);
    if (arr[mid] > key) r = mid - 1;
    if (arr[mid] < key) l = mid + 1;
    if (key == arr[mid]) return mid;
  }
  return -1;
}

search([1, 2, 3, 4, 5], 4);

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
/**异步队列 */

const queue = list => ctx => {
  let func = idx => {
    if (!list[idx]) return Promise.resolve();
    Promise.resolve(list[idx](ctx, func.bind(null, idx + 1)));
  };
  func(0);
};

/**深拷贝 */

function deepClone1(target, map = new WeakMap()) {
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

const deepClone2 = obj => {
  return new Promise(res => {
    let { port1, port2 } = new MessageChannel();
    port1.postMessage(obj);
    port2.onmessage = e => res(e.data);
  });
};
deepClone({ a: 123 }).then(res => console.log(res));

/**最长回文子串 */
/**
 * @param {string} s
 * @return {string}
 */
var longestPalindrome = function (s) {
  let max = "";

  for (let i = 0; i < s.length; i++) {
    // 分奇偶， 一次遍历，每个字符位置都可能存在奇数或偶数回文
    helper(i, i);
    helper(i, i + 1);
  }

  function helper(l, r) {
    // 定义左右双指针
    while (l >= 0 && r < s.length && s[l] === s[r]) {
      l--;
      r++;
    }
    // 拿到回文字符， 注意 上面while满足条件后多执行了一次，所以需要l+1, r+1-1
    const maxStr = s.slice(l + 1, r + 1 - 1);
    // 取最大长度的回文字符
    if (maxStr.length > max.length) max = maxStr;
  }
  return max;
};

/**最长不重复字符串 */

const onlyStr = str => {
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
    if (!obj[key]) {
      (obj[key] = []).push(fn);
    } else {
      obj[key].push(fn);
    }
  };
  let on = (key, ...arg) => {
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

//数组中的第K个最大元素
var findKthLargest = function (nums, k) {
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < nums.length - i; j++) {
      if (nums[j] > nums[j + 1]) {
        [nums[j + 1], nums[j]] = [nums[j], nums[j + 1]];
      }
    }
  }
  console.log(nums);
  return nums[nums.length - k];
};

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
