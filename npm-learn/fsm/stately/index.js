export default statesObject => {
  if (typeof statesObject == "function") statesObject = statesObject();
  let currentState;
  const stateStore = {};
  const getMachineState = () => currentState.name;
  const getMachineEvents = () => {
    let events = [];
    for (const property in currentState) {
      if (typeof currentState[property] == "function") events.push(property);
    }
    return events;
  };
  const stateMachine = { getMachineState, getMachineEvents };
  const setMachineState = (nextState, eventName) => {
    let onChangeState;
    let lastState = currentState;
    const resolveSpecialEventFn = (stateName, fnName) => {
      for (let property in stateStore[stateName]) {
        if (property.toLowerCase() === fnName.toLowerCase()) {
          return stateStore[stateName][property];
        }
      }
    };
    currentState = nextState;
    onChangeState = resolveSpecialEventFn(lastState.name, "onChange");
    if (
      onChangeState &&
      typeof onChangeState == "function" &&
      lastState.name != currentState.name
    ) {
      onChangeState.call(
        stateStore,
        eventName,
        lastState.name,
        currentState.name
      );
    }
  };
  const transition = (stateName, eventName) => {
    const curState = stateStore[stateName][eventName](stateStore);
    setMachineState(curState, eventName);
    return stateMachine;
  };
  for (const stateName in statesObject) {
    stateStore[stateName] = statesObject[stateName];
    for (const event in stateStore[stateName]) {
      const item = stateStore[stateName][event];
      if (typeof item == "string") {
        stateStore[stateName][event] = obj => obj[item];
        stateMachine[event] = transition.bind(null, stateName, event);
      }
    }
    stateStore[stateName].name = stateName;
    currentState = currentState || stateStore[stateName];
  }
  return stateMachine;
};
