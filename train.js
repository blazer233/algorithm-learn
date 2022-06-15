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
// 满足条件所有路径和的遍历
const pathSumBt = (root, target) => {};
// 深拷贝
const deepClone = (target, map = new WeakMap()) => {};
// Promise.Race
const promiseRace = arr => {};
// lengthOfLIS
const lengthOfLIS = nums => {};
//Proxy 劫持
const proxyMap = obj => {};
//对称二叉树
const isSymmetric = tree => {};
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
const asyncPool = async (poolLimit, iterable, iteratorFn) => {};
const asyncPoolArr = async (arr, iteratorFn, limit) => {};
