import "./style.css";
import performWorkUntilDeadline from "./reactSchedule";
import { handleWork, taskDom } from "./tools";
const mainEl = document.querySelector("#box");

let temp;
const mainWork = () => {
  const style = mainEl.getBoundingClientRect();
  if (style.left <= 0) temp = 2;
  if (style.left >= 500) temp = -2;
  mainEl.style.left = style.left + temp + "px";
  requestAnimationFrame(mainWork);
};
// 主进程
mainWork();
setInterval(() => {
  // 模拟react不卡顿主进程的方式
  // performWorkUntilDeadline();
  taskDom.forEach(i => handleWork(i));
}, 2000);
