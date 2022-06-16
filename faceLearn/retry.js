// 支持重试的函数
const asyncReTryFunc = (asyncFunc, times) => {
  return new Promise((resolve, reject) => {
    const reTryFunc = async (time = 0) => {
      asyncFunc()
        .then(res => resolve(res))
        .catch(err => {
          if (time < times) {
            time++;
            setTimeout(() => reTryFunc(time), 500);
          } else {
            reject(err);
          }
        });
    };
    reTryFunc();
  });
};

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
