//最小堆
class MinHeap {
  constructor() {
    this.heap = [];
  }
  // 交换节点位置
  swap(i1, i2) {
    [this.heap[i1], this.heap[i2]] = [this.heap[i2], this.heap[i1]];
  }
  // 获得父节点
  getParentIndex(i) {
    return Math.floor((i - 1) / 2);
  }
  // 获得左节点
  getleftIndex(i) {
    return 2 * i + 1;
  }
  // 获得右节点
  getrightIndex(i) {
    return 2 * i + 2;
  }
  // 上移
  shiftUp(index) {
    if (index === 0) return;
    const parentIndex = this.getParentIndex(index);
    if (this.heap[parentIndex] > this.heap[index]) {
      this.swap(parentIndex, index);
      this.shiftUp(parentIndex);
    }
  }
  // 下移
  shiftDown(index) {
    const leftIndex = this.getleftIndex(index);
    const rightIndex = this.getrightIndex(index);
    if (this.heap[leftIndex] < this.heap[index]) {
      this.swap(leftIndex, index);
      this.shiftDown(leftIndex);
    }
    if (this.heap[rightIndex] < this.heap[index]) {
      this.swap(rightIndex, index);
      this.shiftDown(rightIndex);
    }
  }
  // 插入
  // 将值插入堆的底部，即数组的尾部。
  // 然后递归上移:将这个值和它的父节点进行交换，直到父节点小于等于这个插入的值
  // 大小为k的堆中插入元素的时间复杂度为O(logK)
  insert(value) {
    this.heap.push(value);
    this.shiftUp(this.heap.length - 1);
  }
  // 删除堆顶
  // 用数组尾部元素替换堆顶(直接删除堆顶会破坏堆结构)。
  // 然后下移:将新堆顶和它的子节点进行交换，直到子节点大于等于这个新堆顶。
  // 大小为k的堆中删除堆顶的时间复杂度为O(logK)。
  pop() {
    // pop()方法删除数组最后一个元素并返回，赋值给堆顶
    this.heap[0] = this.heap.pop();
    // 对堆顶重新排序
    this.shiftDown(0);
  }
  // 获取堆顶
  peek() {
    return this.heap[0];
  }
  // 获取堆的大小
  size() {
    return this.heap.length;
  }
}

const findKthLargest = (nums, k) => {
  const h = new MinHeap();
  nums.forEach(i => {
    debugger;
    h.insert(i);
    if (h.size() > k) h.pop();
  });
  return h.peek();
};
