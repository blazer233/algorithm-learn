const initialTime = Date.now();

//获取 performance.now
const getCurrentTime = () =>
  performance && performance.now ? performance.now() : Date.now() - initialTime;

// 定义浏览器帧
const forceFrameRate = (fps = 120) => {
  if (fps < 0 || fps > 125) {
    return console.error(
      "支持 0- 125帧，超过就扯淡了，太牛的不支持，react没工夫干活了"
    );
  }
  if (fps > 0) return Math.floor(1000 / fps);
  return 6;
};

const taskDom = new Array(5000).fill({
  name: "div",
  text: "hello worldhello worldhello",
});
//执行选定任务
const handleWork = task => {
  const el = document.createElement(task.name);
  el.innerHTML = task.text;
  el.style.textAlign = "right";
  document.body.appendChild(el);
};

export { forceFrameRate, getCurrentTime, handleWork, taskDom };
