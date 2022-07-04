/**
 * 两数之和
 */
var twoSum = function (nums, target) {
  const mp = new Map();
  for (let i = 0; i < nums.length; i++) {
    if (mp.has(target - nums[i])) {
      return [mp.get(target - nums[i]), i];
    }
    mp.set(nums[i], i);
  }
};
/**
 * 三数之和
  题意不能有重复的数组, 但是每一个数组中是可以有相同的数字的.

  考虑输入的数组长度小于3的情况;
  先将数组从小到大排序;
  利用for循环以nums[i]为基点数进行遍历;
  在遍历时定义两个起点, 最左侧 left (i + 1) 和最右侧 right (nums.length - 1);
  每次计算nums[i] + nums[left] + nums[right]的值sum;
  若sum大于0则right向左移, 即right--;
  若sum小于0则left向右移, 即left++;
  若sum等于0, 则证明找到了一组数, 依次移动两个起点, 但是每次移动的时候要考虑是否和上一项相等.
 */
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var threeSum = function (nums) {
  // 采用双指针方法
  // 1、首先判断nums数组长度，如果小于3 或者 升序排序后第一个元素大于0 则直接返回空数组
  let res = [];
  nums.sort((a, b) => a - b);
  if (nums.length < 3 || nums[0] > 0) return res;
  // 2、对nums数组进行for循环
  for (let i = 0; i < nums.length; i++) {
    // 3、对连续相同的元素去重 (第一个元素不执行)
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    // 4、定义左指针、右指针
    let [Left, Right] = [i + 1, nums.length - 1];
    // 6、指定当前元素为a 进行while循环判断b和c 条件是Left 小于 Right 由两边向中间夹
    while (Left < Right) {
      let num = nums[i] + nums[Left] + nums[Right];
      // 7、如果num 三数之和等于0 则push到结果数组res中，并且要再判断下一元素是否与当前元素相同
      if (num === 0) {
        res.push([nums[i], nums[Left], nums[Right]]);
        // 8、对左指针的下一元素 也就是左指针右边的元素 进行去重处理
        while (nums[Left] === nums[Left + 1]) Left++;
        // 9、对右指针的下一元素 也就是右指针左边的元素 进行去重处理
        while (nums[Right] === nums[Right - 1]) Right--;
        // 10、如果没有左右都没有重复 则左边指针向右移动一个  右边指针向左移动一个
        Left++;
        Right--;
      }
      // 11、如果num 三数之和小于0 则左指针向右移动一个
      else if (num < 0) {
        Left++;
      }
      // 12、如果num 三数之和大于0 则右指针向左移动一个
      else if (num > 0) {
        Right--;
      }
    }
  }
  // 13、执行完循环，最后返回结果数组 res
  return res;
};
