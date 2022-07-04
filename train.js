// 二分查找
const search = (arr, k) => {};
// promise.All
const promiseAll = arr => {};
// 异步队列
const queue = list => ctx => {
  let func = idx => {
    if (!list[idx]) return Promise.resolve();
    Promise.resolve(list[idx](ctx, func.bind(null, idx + 1)));
  };
  func(0);
};
// 所有路径遍历
const binaryTreePathsBt = (root, target) => {};
// 左子节点之和
var sumOfLeftLeavess = function (root) {};
// 深拷贝
const deepClone = (target, map = new WeakMap()) => {};
// Promise.Race
const promiseRace = arr => {};
// 递增子串
const lengthOfLIS = nums => {};
//Proxy 劫持
const proxyMap = obj => {};
//最长不重复字符串
const onlyStr = str => {};
//dfs 是否为对称二叉树
const isSymmetric = root => {};
//dfs 翻转二叉树
const invertTree = tree => {};
//合并二叉树
//数组转树
const arr = [
  { id: 6, name: "部门1", pid: 0 },
  { id: 1, name: "部门1", pid: 0 },
  { id: 2, name: "部门2", pid: 1 },
  { id: 3, name: "部门3", pid: 1 },
  { id: 4, name: "部门4", pid: 3 },
  { id: 5, name: "部门5", pid: 4 },
];
const dataTotree = arr => {};
//数组转二叉树
const creatTree = val => ({ val, left: "", right: "" });
const array2binary = arr => {};
const asyncPool = async (iteratorFn, limit) => {};
const asyncPoolArr = async (arr, iteratorFn, limit) => {};
const lengthOfLongestSubstring = str => {};
const findKthLargest = function (nums, k) {
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < nums.length - i - 1; j++) {
      if (nums[j] > nums[j + 1]) {
        [nums[j + 1], nums[j]] = [nums[j], nums[j + 1]];
      }
    }
  }
  return nums[nums.length - k];
};
const threeSum = nums => {};
// 数组面积
const maxArea = height => {};
class PubSub {}
