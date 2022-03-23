let knapsack01 = function (w, v, n) {};

console.log(knapsack01([1, 2, 3], [6, 10, 12], 5));

var wiggleMaxLength = function (nums) {
  let idx = 0;
  let s = 0;
  let i = 1;
  while (i < nums.length) {
    debugger;
    if (nums[i] - nums[i - 1] > 0) {
      idx++;
      if (idx > 1) {
        s++;
        idx = 0;
      }
    } else {
      idx--;
      if (idx < 0) {
        s++;
        idx = 0;
      }
    }
    i++;
  }
  return nums.length - s;
};
console.log(wiggleMaxLength([1, 17, 5, 10, 13, 15, 10, 5, 16, 8]));
