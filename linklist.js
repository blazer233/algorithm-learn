/**
 * 链表
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */

/**回文链表
 * https://leetcode.cn/problems/palindrome-linked-list/
 */
var isPalindrome = function (head) {
  const str = "";
  while (head) {
    str += head.val;
    head = head.next;
  }
  for (let i = 0, j = str.length - 1; i < j; ++i, --j) {
    if (vals[i] !== vals[j]) return false;
  }
  return true;
};

/**
 *反转链表
 *https://leetcode.cn/problems/reverse-linked-list/
 */
var reverseList = function (head) {
  let [prev, curr, next] = [null, head, null];
  while (curr) {
    next = curr.next; //next向后移动一位
    [prev, curr, curr.next] = [curr, curr.next, prev];
  }
  return prev;
};

/**
 * 环形链表
 * https://leetcode.cn/problems/linked-list-cycle/
 */
var hasCycle = head => {
  let map = new Map();
  while (head) {
    if (map.has(head)) return true; //如果当前节点在map中存在就说明有环
    map.set(head, true); //否则就加入map
    head = head.next; //迭代节点
  }
  return false; //循环完成发现没有重复节点，说明没环
};
/**
 * 合并两个有序链表
 * https://leetcode.cn/problems/merge-two-sorted-lists/
 */
var mergeTwoLists = function (list1, list2) {
  // 结束条件，两个结点任意一个为null，则返回另外一个
  if (!list1) return list2;
  if (!list2) return list1;
  // 使用cur记录，当前两个结点进行比较后，记录较小的一方
  let cur = null;
  if (list1.val < list2.val) {
    cur = list1;
    // 将较小的结点向后移动一次，并继续比较
    cur.next = mergeTwoLists(list1.next, list2);
  } else {
    cur = list2;
    // 将较小的结点向后移动一次，并继续比较
    cur.next = mergeTwoLists(list1, list2.next);
  }
  // 返回当前比较结果中较小的结点
  return cur;
};

/**
 * 删除链表的倒数第 N 个结点
 * https://leetcode.cn/problems/remove-nth-node-from-end-of-list/
 *
 *
 */

var removeNthFromEnd = function (head, n) {
  let [fast, slow] = [head, head];
  while (n--) fast = fast.next;
  if (!fast) return head.next;
  while (fast.next) {
    fast = fast.next;
    slow = slow.next;
  }
  slow.next = slow.next.next;
  return head;
};

var removeNthFromEnd = function (head, n) {
  // 将 cur 指向 head 的第 n + 1 个节点
  let cur = head;
  while (n--) cur = cur.next;

  // 如果倒数第 n 个节点为 head
  if (cur === null) return head.next;

  // beforeLastN 和 cur 同时向后移动
  let beforeLastN = head;
  while (cur.next) {
    cur = cur.next;
    beforeLastN = beforeLastN.next;
  }

  // 删除倒数第 n 个节点
  beforeLastN.next = beforeLastN.next.next;

  return head;
};
/**

 用快慢指针来解。
 先创建一个dummy节点,放在头结点之前。
 原因：链表有可能长度为n，返回n。（如链表长度为1，返回1）这时用快慢指针就不好操作了。
 注意：要返回的是dummy.next，而不是head。（因为有可能链表长度为1，返回head不对）
 
 fast指针提前走n+1步。然后各自走一步，直到fast指针为空。然后执行删除链表的操作 `slow.next = slow.next.next`就可以了。
 为什么是n+1步，而不是n？
 原因：如果不提前走n+1步，而是走n步，则slow指针刚好停在n节点的位置，删除就不太好删除了。
     如题目中的例1删除4,而slow刚好停在4
 */

var removeNthFromEnd = function (head, n) {
  let dummy = {};
  dummy.next = head;
  let fast = dummy;
  let slow = dummy;
  for (let i = 0; i <= n; i++) {
    fast = fast.next;
  }
  while (fast != null) {
    fast = fast.next;
    slow = slow.next;
  }
  slow.next = slow.next.next;
  return dummy.next;
};

/**
 * 数组转链表
 */
const array2list = arr => {
  let nodes = arr.map(i => ({ val: i, next: null }));
  for (var i = 0; i < arr.length - 1; i++) {
    nodes[i].next = nodes[i + 1];
  }
  return nodes[0];
};
