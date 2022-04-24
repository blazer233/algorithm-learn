var tree = {
  val: 1,
  right: {
    val: 7,
    right: {
      val: 9
    },
    left: {
      val: 8
    }
  },
  left: {
    val: 2,
    right: {
      val: 4,
      left: {
        val: 5
      },
      right: {
        val: 6
      }
    },
    left: {
      val: 3
    }
  }
};

const dfs = (tree, value = []) => {
  if (!tree.val) return;
  value.push(tree.val);
  if (tree.right) dfs(tree.right, value);
  if (tree.left) dfs(tree.left, value);
  return value;
};

//bfs 遍历N树
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
      for (let item of node.children) {
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
  if (root) stack.push(root);
  while (stack.length) {
    res++;
    let len = stack.length;
    for (let i = 0; i < len; i++) {
      let node = stack.shift();
      if (node.left) {
        stack.push(node.left);
      }
      if (node.left) {
        stack.push(node.right);
      }
    }
  }
  return res;
};

//bfs 二叉树深度（小）
var minDepth = function (root) {
  let res = 0;
  let stack = [];
  if (root) stack.push(root);
  while (stack.length) {
    let len = stack.length;
    res++;
    for (let i = 0; i < len; i++) {
      let node = stack.shift();
      if (!node.right && !node.left) {
        return res;
      }
      if (node.left) {
        stack.push(node.left);
      }
      if (node.right) {
        stack.push(node.right);
      }
    }
  }
  return res;
};

//bfs 翻转二叉树
var invertTree = function (root) {
  if (!root) return root;
  let stack = [root];
  while (stack.length) {
    let node = stack.shift();
    [node.left, node.right] = [node.right, node.left];
    if (node.left) stack.push(node.left);
    if (node.right) stack.push(node.right);
  }
  return root;
};

//bfs 所有路径
/**
 * 我们维护一个队列，存储节点以及根到该节点的路径。一开始这个队列里只有根节点。
 * 在每一步迭代中，我们取出队列中的首节点，如果它是叶子节点，则将它对应的路径加入到答案中。
 * 如果它不是叶子节点，则将它的所有孩子节点加入到队列的末尾。当队列为空时广度优先搜索结束，我们即能得到答案。
 */
var binaryTreePaths = function (root) {
  if (!root) return root;
  let stack = [root];
  let paths = [root.val];
  let res = [];
  while (stack.length) {
    let node = stack.shift();
    let path = paths.shift();
    if (!node.left && !node.right) {
      res.push(path);
    } else {
      if (node.left) {
        stack.push(node.left);
        paths.push(`${path}->${node.left.val}`);
      }
      if (node.right) {
        stack.push(node.right);
        paths.push(`${path}->${node.right.val}`);
      }
    }
  }
  return res;
};
console.log(binaryTreePaths(tree));
