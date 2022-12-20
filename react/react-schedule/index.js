import MinHeap from "./heap";
const workMinHeap = new MinHeap();
const channel = new MessageChannel();
channel.port1.onmessage = workLoop;
export const getCurrntTime = () => performance.now();
let taskIdCounter = 0;

const RUNTIME = 16;
export const scheduleCallback = callback => {
  const currentTime = getCurrntTime();
  const timeout = -1;
  const expirtationTime = currentTime + timeout;
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
  const currentTask = workMinHeap.peek();
  do {
    const { callback } = currentTask;
    callback();
    workMinHeap.pop();
    currentTask = workMinHeap.peek();
  } while (workMinHeap.size() && performance.now() - prevTime < RUNTIME);
  channel.port2.postMessage("");
}
