import { startMachine } from "./core";

const baseFSM = startMachine({
  id: "light",
  // 初始化状态，绿灯
  initial: "green",
  // 状态定义
  states: {
    green: {
      on: {
        // 事件名称，如果触发 TIMRE 事件，直接转入 yellow 状态
        TIMRE: "yellow",
      },
    },
    yellow: {
      on: {
        TIMER: "red",
      },
    },
    red: {
      on: {
        TIMER: "green",
      },
    },
  },
});
// 设置当前状态
const currentState = "green";
baseFSM.transition(currentState, "TIMER");
