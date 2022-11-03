import { interpret } from "./interpret";
import StateMachine from "./StateMachine.js";

/**
 * 启动状态机
 * @param {*} fsmConfig
 * @param {*} comInstance
 */
export function startMachine(fsmConfig) {
  const machine = new StateMachine(fsmConfig, { data: fsmConfig.context });
  const service = interpret(machine);
  service.start();
  return service;
}
