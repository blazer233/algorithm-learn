const creatTree = val => ({ val, left: "", right: "" });
const array2binary = arr => {
  if (!arr || !arr.length) return;
  let index = 0;
  const head = creatTree(arr[index]);
  const queue = [head];
  while (index < arr.length) {
    index++;
    const parent = queue.shift();
    if (arr[index]) {
      const node = creatTree(arr[index]);
      parent.left = node;
      queue.push(node);
    }
    index++;
    if (arr[index]) {
      const node = creatTree(arr[index]);
      parent.right = node;
      queue.push(node);
    }
  }
  return head;
};
const tree = array2binary([5, 1, 4, null, null, 3, 6]);
const binaryTreePathsBt = tree => {
  let stack = [[tree, tree.val]];
  let res = [];
  while (stack.length) {
    let [node, path] = stack.shift();
    if (!node.left && !node.right) {
      res.push(path);
    } else {
      if (node.left) {
        stack.push([node.left, `${path}->${node.left.val}`]);
      }
      if (node.right) {
        stack.push([node.right, `${path}->${node.right.val}`]);
      }
    }
  }
  return res;
};
/**
 * @param {TreeNode} root
 * @param {number} sum
 * @return {number[][]}
 */
var pathSum = function (root, sum) {
  if (!root) return [];
  const statck = [[root, sum, [root.val]]];
  const result = [];

  while (statck.length) {
    const [node, num, path] = statck.pop();

    if (!node.left && !node.right && node.val === num) {
      result.push(path);
    }

    if (node.right) {
      statck.push([node.right, num - node.val, [...path, node.right.val]]);
    }
    if (node.left) {
      statck.push([node.left, num - node.val, [...path, node.left.val]]);
    }
  }

  return result;
};

const pathSumBt = (root, target) => {
  if (root == null) return [];
  let stack = [[root, root.val, root.val]];
  let res = [];
  while (stack.length) {
    let [node, val, path] = stack.shift();
    const cal = str => [
      node[str],
      node[str].val + val,
      `${path}${node[str].val}`,
    ];
    if (!node.left && !node.right && val == target) {
      res.push(path);
    } else {
      if (node.left) {
        stack.push(cal("left"));
      }
      if (node.right) {
        stack.push(cal("right"));
      }
    }
  }
  return res;
};
var findMode = function (root, target = {}) {
  if (!root) return;
  if (root.left) findMode(root.left, target);
  target[root.val] = (target[root.val] || 0) + 1;
  if (root.right) findMode(root.right, target);
  return target;
};

const dfs = (root, res = []) => {
  if (!root) return;
  dfs(root.left, res);
  res.push(root.val);
  dfs(root.right, res);
  return res;
};

var postorder = function (root) {
  if (!root) return [];
  const res = [];
  let stack = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    res.push(node.val);
    stack = [...stack, ...node.child];
  }
  return res.reverse();
};
const levelOrder = tree => {
  let stack = [];
  let res = [];
  if (tree) stack.push(tree);
  while (stack.length) {
    let num = [];
    let size = stack.length;
    for (let i = 0; i < size; i++) {
      let node = stack.shift();
      num.push(node.val);
      for (let item of node.child) {
        if (item) stack.push(item);
      }
    }
    res.push(num);
  }
  return res;
};

//bfs 二叉树深度（大）
var maxDepth = function (root) {
  let res = 0;
  let stack = [];
  let resList = [];
  if (root) stack.push(root);
  while (stack.length) {
    res++;
    let node = stack.pop();
    resList.push(node.val);
    if (node.left) stack.push(node.left);
    if (node.left) stack.push(node.right);
  }
  return { res, resList };
};

//bfs 二叉树深度（小）
var minDepth = function (root) {
  let res = 0;
  let stack = [];
  if (root) stack.push(root);
  while (stack.length) {
    res++;
    let node = stack.shift();
    if (!node.right || !node.left) {
      return res;
    }
    if (node.left) stack.push(node.left);
    if (node.right) stack.push(node.right);
  }
  return res;
};

//dfs 翻转二叉树
var invertTree = function (root) {
  if (!root) return root;
  let stack = [root];
  while (stack.length) {
    let node = stack.pop();
    [node.left, node.right] = [node.right, node.left];
    if (node.left) stack.push(node.left);
    if (node.right) stack.push(node.right);
  }
  return root;
};

//bfs 二叉树最右边
var rightSideView = function (root) {
  if (!root) return [];
  const stack = [root];
  const res = [];
  while (stack.length) {
    let temp = null;
    let length = stack.length;
    for (let i = 0; i < length; i++) {
      const node = stack.shift();
      temp = node.val;
      if (node.left) stack.push(node.left);
      if (node.right) stack.push(node.right);
    }
    res.push(temp);
  }
  return res;
};
//最近公共祖先
var lowestCommonAncestor = function (root, p, q) {
  if (!root || root === p || root === q) return root;
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  if (!left) return right;
  if (!right) return left;
  return root;
};

/**
 * @param {number[]} nums
 * @return {number}
 */
var findMaxLength = function (nums) {
  const n = nums.length;
  const map = new Map();
  map.set(0, -1);
  // 前缀和
  let pre = 0;
  let res = 0;
  for (let i = 0; i < n; i++) {
    pre += nums[i] == 0 ? -1 : 1;
    // 如果存在的话，则将当前索引和之前存入的索引值相减  取题目要求的最大值
    if (map.has(pre)) {
      res = Math.max(res, i - map.get(pre));
    } else {
      // 记录前缀和索引
      map.set(pre, i);
    }
  }
  return res;
};

/**
最后一个节点是根节点
找到第一个大于根节点的值，这个值把数组分为两部分，左树（可能为空）和 右树（可能为空）
这个值后边所有的数都要大于根节点的值，如果不是，直接返回 false，否则判断左树和右树，
至于右树怎么排，不用考虑（比如有两个点，也是可以的，注意不是二叉树返回的排列包括null的，只是数字，不要考虑二叉树的结构
 */
function fn(arr, left, right) {
  if (left >= right) {
    return true;
  }
  let p = -1,
    nodeVal = arr[right];
  for (let i = 0; i < right; i++) {
    // 找第一个大于根节点的节点，就是右树的开始
    if (p == -1 && arr[i] > nodeVal) {
      p = i;
    }
    // 如果右树，有任意小于根节点的直接返回false
    if (p > -1 && i >= p && arr[i] < nodeVal) {
      return false;
    }
  }
  if (p > -1) {
    return fn(arr, left, p - 1) && fn(arr, p, right - 1);
  } else {
    return fn(arr, left, right - 1);
  }
}

//路径总和
var hasPathSum = function (root, targetSum) {
  if (!root) return false;
  if (!root.left && !root.right && targetSum === root.val) return true;
  return (
    hasPathSum(root.left, targetSum - root.val) ||
    hasPathSum(root.right, targetSum - root.val)
  );
};
var sumNumberbts = function (root) {
  if (!root) return;
  let stack = [[root, root.val]];
  let res = 0;
  while (stack.length) {
    let [node, num] = stack.pop();
    if (!node.left && !node.right) {
      res += num;
    }
    if (node.left) stack.push([node.left, node.left.val + num]);
    if (node.right) stack.push([node.right, node.right.val + num]);
  }
  return res;
};

var sumNumbers = function (root) {
  let sum = 0;
  function dfs(root, curVal = 0) {
    if (!root) return;
    curVal += root.val;
    if (!root.left && !root.right) {
      sum += Number(curVal);
    }
    dfs(root.left, curVal);
    dfs(root.right, curVal);
  }
  dfs(root);
  return sum;
};

//是否为对称二叉树
var isSymmetric = function (root) {
  if (!root) return true;
  const dfs = (l, r) => {
    if (!l && !r) return true;
    if (!l || !r) return false;
    if (l.val !== r.val) return false;
    return dfs(l.left, r.right) && dfs(l.right, r.left);
  };
  return dfs(root.left, root.right);
};

/**左子节点之和 */
var sumOfLeftLeavess = function (root) {
  if (!root) return;
  let stack = [[root, false]];
  let res = 0;
  while (stack.length) {
    let [node, isleft] = stack.pop();
    if (node.left) stack.push([node.left, true]);
    if (node.right) stack.push([node.right, false]);
    if (isleft && !node.left && !node.right) {
      res += node.val;
    }
  }
  return res;
};
//二叉树深度
var maxDepth = function (root) {
  return root ? Math.max(maxDepth(root.left), maxDepth(root.right)) + 1 : 0;
};
var mergeTrees = function (root1, root2) {
  // if (!root2 && !root1) return;
  // if (!root1) return root2;
  // if (!root2) return root1;
  // let stack = [[root1, root2]];
  // let res = [];
  // while (stack.length) {
  //   let [node1, node2] = stack.pop();
  //   res.val = node1.val + node2.val;
  // }
};
//合并二叉树
var mergeTrees = function (root1, root2) {
  if (!root1) return root2;
  if (!root2) return root1;
  root1.val += root2.val;
  root1.left = mergeTrees(root1.left, root2.left);
  root1.right = mergeTrees(root1.right, root2.right);
  return root1;
};

var arr = [
  { id: 6, name: "部门1", pid: 0 },
  { id: 1, name: "部门1", pid: 0 },
  { id: 2, name: "部门2", pid: 1 },
  { id: 3, name: "部门3", pid: 1 },
  { id: 4, name: "部门4", pid: 3 },
  { id: 5, name: "部门5", pid: 4 },
];
function arrayToTree(arr) {
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
console.log(arrayToTree(arr));
