import {
  getCurrentTime as getTime,
  forceFrameRate as yieldTime,
  handleWork,
  taskDom,
} from "./tools";
const { port1, port2 } = new MessageChannel();

//当前帧剩余时间 = 当前帧结束时间(frameDeadline) - 当前帧花费的时间

// 执行任务
const scheduledHostCallback = (deadline = 0) => {
  // 使用数组实现
  while (taskDom.length > 0) {
    if (getTime() >= deadline) break;
    const task = taskDom.pop();
    handleWork(task);
  }
  return !!taskDom.length;
};

const performWorkUntilDeadline = () => {
  scheduledHostCallback(getTime() + yieldTime()) && port2.postMessage(null);
};

port1.onmessage = performWorkUntilDeadline;

export default performWorkUntilDeadline;
