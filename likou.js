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
let value = [];
//二叉树深度
var maxDepth = function (root) {
  return root ? Math.max(maxDepth(root.left), maxDepth(root.right)) + 1 : 0;
};
//验证二叉树深度 正序便利
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
    let [left, right] = stack.pop();
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
  let result = -Infinity;
  let count = 0;
  for (let i = 0; i < nums.length; i++) {
    count += nums[i];
    result = Math.max(count, result);
    if (count < 0) count = 0; //重新修正
  }
  return result;
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
let nums1 = [7, 1, 5, 3, 6, 4];
var maxProfitdp = function (prices) {
  let base = prices[0];
  let num = 0;
  let i = 0;
  while (prices.length > i) {
    base = Math.min(prices[i], base);
    num = Math.max(num, prices[i] - base);
    i++;
  }
  return num;
};
//最长递增子序列 (指针、贪心)
var lengthOfLIS = function (nums) {
  if (!nums || !nums.length) return 0;
  let stack = [nums[0]];
  for (let i of nums) {
    if (i > stack[stack.length - 1]) {
      stack.push(i);
    } else {
      stack[stack.findIndex(n => n >= i)] = i;
    }
  }
  return stack.length;
};
console.log(lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18]));
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
  let max = 1;
  let idx = 1;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] > nums[i - 1]) {
      idx++;
    } else {
      idx = 1;
    }
    max = Math.max(idx, max);
  }
  return max;
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
