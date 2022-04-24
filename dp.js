const fib = n => {
  let dp = [0, 1];
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
};
console.log(fib(15));

/**
 * @param {number[]} nums
 * @return {number}
 */
// function maxSubArray(nums) {
//   const dp = new Array(nums.length);
//   dp[0] = nums[0];
//   for (let i = 1; i < nums.length; i++) {
//     if (dp[i - 1] > 0) dp[i] = dp[i - 1] + nums[i];
//     else dp[i] = nums[i];
//   }
//   console.log(dp);
//   return Math.max(...dp);
// }
// var maxSubArray = function (nums) {
//   if (!nums.length) return 0;
//   let dp = new Array(nums.length).fill(0);
//   dp[0] = nums[0];
//   // 状态转移方程
//   for (let i = 1; i < nums.length; i++) {
//     dp[i] = Math.max(nums[i], nums[i] + dp[i - 1]);
//   }
//   return Math.max(...dp);
// };

// console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]));

/**
 * dp[i,j]
 * dp[i][j]表示将前i件物品装进限重为j的背包可以获得的最大价值, 0<=i<=N, 0<=j<=W
 * 不放物品i dp[i-1][j]
 * 放物品i dp[i-1][j-weight[i]]+val[i]
 * dp[i][j] = math.max(dp[i-1][j],dp[i-1][j-weight[i]]+val[i])
 */
threeBody = (array, n) => {
  array.sort((a, b) => {
    return b - a;
  });
  let list = [];
  for (let j = 0; j < n; j++) {
    list[j] = [];
  }
  let arr = [];
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < n; j++) {
      arr[j] = sum(list[j]);
    }
    min = Math.min(...arr);
    for (let j = 0; j < n; j++) {
      if (min == arr[j]) {
        list[j].push(array[i]);
        break;
      }
    }
  }
  return list, arr;
};

chooseOrNot = (List, halfNum) => {
  let len = List.length;
  let f = new Array(len);
  f[-1] = new Array(halfNum + 1).fill(0); //使f[0-1][j]存在
  let selected = [];
  for (let i = 0; i < len; i++) {
    f[i] = []; //创建二维数组
    for (let j = 0; j <= halfNum; j++) {
      if (j < List[i]) {
        f[i][j] = f[i - 1][j]; //物体比背包大
      } else {
        f[i][j] = Math.max(f[i - 1][j], f[i - 1][j - List[i]] + List[i]);
      }
    }
  }
  let j = halfNum,
    w = 0;
  for (let i = len - 1; i >= 0; i--) {
    if (f[i][j] > f[i - 1][j]) {
      selected.push(i);
      j = j - List[i];
      w += List[i];
    }
  }
  return [f[len - 1][halfNum], selected];
};
