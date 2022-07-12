export default class MinHeap {
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
    if (!index) return;
    const parentIndex = this.getParentIndex(index);
    if (compare(this.heap[parentIndex], this.heap[index]) > 0) {
      this.swap(parentIndex, index);
      this.shiftUp(parentIndex);
    }
  }
  shiftDown(index) {
    const leftIndex = this.getleftIndex(index);
    const rightIndex = this.getrightIndex(index);
    if (compare(this.heap[leftIndex], this.heap[index]) > 0) {
      this.swap(leftIndex, index);
      this.shiftDown(leftIndex);
    }
    if (compare(this.heap[rightIndex], this.heap[index]) > 0) {
      this.swap(rightIndex, index);
      this.shiftDown(rightIndex);
    }
  }
  insert(value) {
    this.heap.push(value);
    this.shiftUp(this.heap.length - 1);
  }
  pop() {
    this.heap[0] = this.heap.pop();
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
function compare(a, b) {
  //   return a - b;
  const diff = a.sortIndex - b.sortIndex;
  return diff !== 0 ? diff : a.id - b.id;
}
