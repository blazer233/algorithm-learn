const threeSum = nums => {
  nums.sort((a, b) => a - b); // 排序
  const res = [];
  for (let i = 0; i < nums.length - 2; i++) {
    // 外层遍历
    let n1 = nums[i];
    if (n1 > 0) break; // 如果已经爆0，不用做了，break
    if (i - 1 >= 0 && n1 == nums[i - 1]) continue; // 遍历到重复的数，跳过

    let left = i + 1; // 左指针
    let right = nums.length - 1; // 右指针

    while (left < right) {
      let n2 = nums[left],
        n3 = nums[right];

      if (n1 + n2 + n3 === 0) {
        // 三数和=0，加入解集res
        res.push([n1, n2, n3]);
        while (left < right && nums[left] == n2) left++; // 直到指向不一样的数
        while (left < right && nums[right] == n3) right--; // 直到指向不一样的数
      } else if (n1 + n2 + n3 < 0) {
        // 三数和小于0，则左指针右移
        left++;
      } else {
        // 三数和大于0，则右指针左移
        right--;
      }
    }
  }
  return res;
};
