/**
 * 0 1 2 3 4 5
 * 0 1 0 2 3 1
 * 1 2 1 3 4 4
 *
 * 1. 维护一个子序列存放当前的上升序列
 * 2. 将当前数与子序列最大值比较，如果比最大值大之间加入队尾，如果更新则找一个合适的位置替换当前位置的元素
 */
//
const lengthOfLIS = nums => {
  if (!nums || !nums.length) return 0;
  let res = [nums[0]];
  for (let i of nums) {
    if (i > res[res.length - 1]) {
      res.push(i);
    } else {
      // s[s.findIndex(s => s >= i)] = i;
      let [l, r] = [0, res.length - 1];
      while (r >= l) {
        let mid = Math.floor((r + l) / 2);
        if (res[mid] >= i) r = mid - 1;
        if (res[mid] < i) l = mid + 1;
      }
      res[l] = i;
    }
  }
  return res.length;
};
const lengthOfLISdp = function (nums) {
  const dp = new Array(nums.length).fill(1);
  for (let i = 1; i < nums.length; i++) {
    // i与i前面的元素比较
    for (let j = 1; j < i; j++) {
      // 找比i小的元素，找到一个，就让当前序列的最长子序列长度加1
      if (nums[i] > nums[j]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }
  return Math.max(...dp);
};
console.log(lengthOfLIS([0, 1, 0, 2, 3, 1]));
