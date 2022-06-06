var tree = {
  val: 1,
  left: {
    val: 2,
    left: {
      val: 3
    },
    right: {
      val: 4,
      left: {
        val: 5
      },
      right: {
        val: 6
      }
    }
  },
  right: {
    val: 7,
    left: {
      val: 8
    },
    right: {
      val: 9
    }
  }
};
//二叉树深度
var maxDepth = function (root) {
  return root ? Math.max(maxDepth(root.left), maxDepth(root.right)) + 1 : 0;
};

// 正序便利
function isPass(node, valueArr = []) {
  if (!node.val) return;
  if (node.left) isPass(node.left, valueArr);
  valueArr.push(node.val);
  if (node.right) isPass(node.right, valueArr);
  return valueArr;
}

var isValidBST = function (root) {
  let arr = isPass(root);
  for (let i = 1; i < arr.length; i++) {
    //检测是否顺序
    if (arr[i] < arr[i - 1]) return false;
  }
  return true;
};

//验证对称二叉树深度 （很有用）
var isSymmetric = root => {
  if (!root) return;
  let stack = [[root.left, root.right]];
  while (stack.length) {
    let [left] = stack.pop();
    if (!left && !right) continue;
    if (!left || !right || right.val != left.val) return false;
    stack.push([left.left, right.right]);
    stack.push([left.right, right.left]);
  }
  return true;
};

//最大子序和 (贪心算法)
var nums = [-2, -1, -3, 3, -1, -2, -1, -5, -4];
var maxSubArray = function (nums) {
  let count = 0;
  let res = -Infinity;
  for (let i of nums) {
    count += i;
    res = Math.max(count, res);
    if (count < 0) count = 0;
  }
  return res;
};

//均分三份的数组 (贪心算法)
var canThreePartsEqualSum = function (arr) {
  let sum = arr.reduce((a, b) => a + b, 0);
  let len = 3;
  let res = 0;
  for (let i of arr) {
    res += i;
    if (res == sum / 3) {
      len--;
      res = 0;
    }
  }
  return len <= 0;
};

//股票购买时机 (贪心算法)
var maxProfitdp = function (prices) {
  let res = prices[0];
  let num = -Infinity;
  for (let i of prices) {
    res = Math.min(res, i);
    num = Math.max(num, i - res);
  }
  return num;
};

//最长递增子序列 (指针、贪心)
var lengthOfLIS = function (nums) {
  if (!nums || !nums.length) return 0;
  let res = [nums[0]];
  for (let i of nums) {
    if (i > res[res.length - 1]) {
      res.push(i);
    } else {
      res[res.findIndex(s => s >= i)] = i;
    }
  }
  return res;
};

// 经典哈希表
var removeElement = function (nums) {
  const target = {};
  let res = 0;
  for (const num of nums) {
    target[num] = (target[num] || 0) + 1;
  }
  Object.keys(target).forEach(i => {
    if (target[+i + 1]) {
      res = Math.max(res, target[i] + target[+i + 1]);
    }
  });
  return res;
};

//最大连续子序 (经典贪心算法)
var findLengthOfLCIS = function (nums) {
  let res = 0;
  let num = -Infinity;
  let symbol = 0;
  for (let i of nums) {
    if (i > num) {
      num = i;
      res++;
    } else {
      num = -Infinity;
      res = 0;
    }
    symbol = Math.max(symbol, res);
  }
  return symbol;
};

//Boyer-Moore 投票算法(保证有这个数出现次数大于length/2)
var majorityElement = function (nums) {
  let base = 0;
  let vote = 0;
  for (let item of nums) {
    if (vote === 0) {
      base = item;
    }
    vote += base === item ? +1 : -1;
  }
  return base;
};

//是否包含子串 指针思想
var isSubsequence = function (s, t) {
  let l = 0;
  if (s === t) return true;
  for (let i = 0; i < t.length; i++) {
    if (t[i] === s[l]) {
      l++;
    }
    if (l >= s.length) return true;
  }
  return false;
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

// 分割平衡字符串
var balancedStringSplit = function (s) {
  let ans = 0,
    d = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] == "L") {
      d++;
    } else {
      d--;
    }
    if (d == 0) {
      ans++;
    }
  }
  return ans;
};

//最长不重复字符串
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
