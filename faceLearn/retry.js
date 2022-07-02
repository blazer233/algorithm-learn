// 支持重试的函数
const asyncReTryFuncs = (fn, times) =>
  new Promise((reslove, rej) => {
    const tryFn = (tim = 0) => {
      fn()
        .then(res => reslove(res))
        .catch(err => {
          tim++;
          tim < times ? tryFn(tim) : rej(err);
        });
    };
    tryFn();
  });

var findKthLargest = function (nums, k) {
  for (let i = nums.length; i > nums.length - k - 1; i--) {
    for (let j = 0; j < i; j++) {
      if (nums[j] > nums[i]) {
        [nums[j], nums[i]] = [nums[i], nums[j]];
      }
    }
  }
  return nums[nums.length - k];
};
findKthLargest([3, 2, 1, 5, 6, 4]);
