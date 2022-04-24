/**
 * 0 1 2 3 4 5
 * 0 1 0 2 3 1
 * 1 2 1 3 4 4
 */
const lengthOfLIS = nums => {
  if (!nums || !nums.length) return 0;
  let s = [nums[0]];
  for (let i of nums) {
    if (i > s[s.length - 1]) {
      s.push(i);
    } else {
      s[s.findIndex(s => s >= i)] = i;
      // let left = 0;
      // let right = s.length - 1;
      // while (left < right) {
      //   let mid = (left + right) >> 1;
      //   if (s[mid] < i) {
      //     left = mid + 1;
      //   } else {
      //     right = mid;
      //   }
      // }
      // s[left] = i;
    }
  }
  return s;
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
