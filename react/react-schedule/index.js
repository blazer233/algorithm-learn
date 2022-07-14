import MinHeap from "./heap";
const workMinHeap = new MinHeap();
const channel = new MessageChannel();
channel.port1.onmessage = workLoop;
export const getCurrntTime = () => performance.now();
let taskIdCounter = 0;

export const scheduleCallback = callback => {
  const currentTime = getCurrntTime();
  const timeout = -1;
  const expirtationTime = currentTime - timeout;
  workMinHeap.insert({
    id: taskIdCounter++,
    callback,
    expirtationTime,
    sortIndex: expirtationTime,
  });
  // 请求调度
  channel.port2.postMessage(null);
};

function workLoop() {
  let currentTask = workMinHeap.peek();
  while (currentTask) {
    const { callback } = currentTask;
    currentTask.callback = null;
    callback();
    workMinHeap.pop();
    currentTask = workMinHeap.peek();
  }
}
