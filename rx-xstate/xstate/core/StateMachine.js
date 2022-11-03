import { INIT_EVENT } from "./util";

// 指令分隔符
const DIRECTIVE_SPLIT = ":";

function toArray(item) {
  return !!item ? [item] : [];
}

function handleActions(actions, context, event, eventData) {
  const copyContext = Object.assign({}, context);
  let newContext = {};
  let assigned = false;
  const nonAssignActions = [];
  actions.forEach(action => {
    const tmpContext = Object.assign({}, newContext);
    if (typeof action == "function") {
      nonAssignActions.push(action);
    } else if (typeof action == "object") {
      const keys = Object.keys(action);
      if (keys.length > 0) {
        assigned = true;
      }
      keys.forEach(tmpKey => {
        let key = tmpKey;
        let hasDirect = false;
        if (tmpKey.indexOf(DIRECTIVE_SPLIT) > 0) {
          key = tmpKey.split(DIRECTIVE_SPLIT)[0];
          hasDirect = true;
        }
        if (!action[key]) {
          action[key] = ({ detail }) => detail[key];
        }
        tmpContext[key] =
          typeof action[key] == "function"
            ? action[key]({ context: copyContext, event, detail: eventData })
            : action[key];
        if (hasDirect) {
          tmpContext[tmpKey] = tmpContext[key];
        }
      });
    }
    newContext = tmpContext;
    // 合并数据到context副本
    // 确保下一个action拿到最新的context
    Object.assign(copyContext, newContext);
  });
  return [nonAssignActions, newContext, assigned];
}

function createUnchangedState(value) {
  return {
    value,
    context: null,
    changed: false,
  };
}

export default class StateMachine {
  constructor(config, comInstance) {
    this.config = config;
    this.comInstance = comInstance;
    const [initialActions] = handleActions(
      [config.states[config.initial].entry],
      this.comInstance.data,
      INIT_EVENT
    );
    this.initialState = {
      value: config.initial,
      actions: initialActions,
      context: null,
      changed: false,
    };
  }

  transition(state, event, eventData) {
    const { config } = this;
    const { value } = typeof state == "string" ? { value: state } : state;
    const stateConfig = config.states[value];
    if (!stateConfig) {
      throw new Error(
        `State '${value}' not found on machine ${config.id || ""}`
      );
    }
    if (stateConfig.on && stateConfig.on[event]) {
      const transitionConfig = stateConfig.on[event];
      const { target, actions } =
        typeof transitionConfig == "string"
          ? { target: transitionConfig }
          : transitionConfig;
      const isTargetless = target === undefined;
      const nextStateValue = target || value;
      const nextStateConfig = config.states[nextStateValue];
      if (!nextStateConfig) {
        throw new Error(
          `State '${nextStateValue}' not found on machine ${config.id || ""}`
        );
      }
      const allActions = isTargetless
        ? toArray(actions)
        : []
            .concat(stateConfig.exit, actions, nextStateConfig.entry)
            .filter(item => item);
      const [nonAssignActions, nextContext, assigned] = handleActions(
        allActions,
        event,
        eventData
      );
      return {
        value: nextStateValue,
        actions: nonAssignActions,
        context: nextContext,
        changed: target !== value || assigned,
      };
    }
    return createUnchangedState(value);
  }

  dispose() {
    this.comInstance = null;
  }
}
