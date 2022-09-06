import { isFun, isObj, isStr, isEqu } from "./tools";

export default statesObject => {
  if (isFun(statesObject)) statesObject = statesObject();
  let currentState;
  let stateStore = {
    getMachineState: () => currentState.name,

    setMachineState: nextState => {
      if (isStr(nextState)) nextState = stateStore[nextState];
      currentState = nextState;
      return stateStore;
    },

    getMachineEvents: () => {
      let events = [];
      for (const property in currentState) {
        if (isFun(currentState[property])) events.push(property);
      }
      return events;
    },
  };

  const stateMachine = {
    getMachineState: stateStore.getMachineState,
    getMachineEvents: stateStore.getMachineEvents,
  };

  const transition = (stateName, eventName, nextEvent) => {
    let nextState;
    let eventValue = stateMachine;
    if (stateStore[stateName].name !== currentState.name) {
      // 调用方法不存在
      if (nextEvent) {
        eventValue = nextEvent.call(stateStore, statesObject);
      }
      return eventValue;
    }
    eventValue = stateStore[stateName][eventName](stateStore);

    if (!eventValue) {
      nextState = currentState;
      eventValue = stateMachine;
    } else if (isStr(eventValue)) {
      nextState = stateStore[eventValue];

      eventValue = stateMachine;
    } else if (Array.isArray(eventValue)) {
      if (!eventValue[0]) {
        nextState = currentState;
      } else if (isStr(eventValue[0])) {
        nextState = stateStore[eventValue[0]];
      } else {
        nextState = eventValue[0];
      }

      eventValue = eventValue[1] || stateMachine;
    } else if (isObj(eventValue)) {
      nextState = isEqu(eventValue, stateStore) ? currentState : eventValue;
      eventValue = stateMachine;
    }
    stateStore.setMachineState(nextState, eventName);
    return eventValue;
  };

  for (const stateName in statesObject) {
    stateStore[stateName] = statesObject[stateName];
    for (const event in stateStore[stateName]) {
      const item = stateStore[stateName][event];
      stateStore[stateName][event] = obj => obj[item];
      stateMachine[event] = transition.bind(
        null,
        stateName,
        event,
        stateMachine[event]
      );
    }
    stateStore[stateName].name = stateName;
    currentState = currentState || stateStore[stateName];
  }
  return stateMachine;
};
