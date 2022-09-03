const isStr = arg => arg && typeof arg === "string";
const isObj = arg => arg && typeof arg === "object";
const isFun = arg => arg && typeof arg === "function";

function Stately(statesObject) {
  if (isFun(statesObject)) statesObject = statesObject();
  let currentState;

  const resolveSpecialEventFn = (stateName, fnName) => {
    for (let property in stateStore[stateName]) {
      if (property.toLowerCase() === fnName.toLowerCase()) {
        return stateStore[stateName][property];
      }
    }
  };

  const stateStore = {
    getMachineState() {
      return currentState.name;
    },

    setMachineState(nextState, eventName) {
      let onEnterState;
      let onLeaveState;
      let lastState = currentState;

      if (isStr(nextState)) {
        nextState = stateStore[nextState];
      }

      currentState = nextState;

      onLeaveState = resolveSpecialEventFn(lastState.name, "onLeave");

      if (
        onLeaveState &&
        isFun(onLeaveState) &&
        lastState.name != currentState.name
      ) {
        onLeaveState.call(
          stateStore,
          eventName,
          lastState.name,
          currentState.name
        );
      }

      onEnterState = resolveSpecialEventFn(currentState.name, "onEnter");

      if (
        onEnterState &&
        isFun(onEnterState) &&
        lastState.name != nextState.name
      ) {
        onEnterState.call(
          stateStore,
          eventName,
          lastState.name,
          nextState.name
        );
      }

      return this;
    },

    getMachineEvents() {
      let events = [];
      for (const property in currentState) {
        if (isFun(currentState[property])) {
          events.push(property);
        }
      }
      return events;
    }
  };
  const stateMachine = {
    getMachineState: stateStore.getMachineState,
    getMachineEvents: stateStore.getMachineEvents
  };

  const transition = (stateName, eventName, nextEvent) => {
    let onBeforeEvent;
    let onAfterEvent;
    let nextState;
    let eventValue = stateMachine;

    if (stateStore[stateName] !== currentState) {
      if (nextEvent) {
        eventValue = nextEvent.call(stateStore, statesObject);
      }

      return eventValue;
    }

    onBeforeEvent = resolveSpecialEventFn(
      currentState.name,
      `onBefore${eventName}`
    );

    if (isFun(onBeforeEvent)) {
      onBeforeEvent.call(
        stateStore,
        eventName,
        currentState.name,
        currentState.name
      );
    }

    eventValue = stateStore[stateName][eventName].call(
      stateStore,
      statesObject
    );

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
      nextState = eventValue === stateStore ? currentState : eventValue;

      eventValue = stateMachine;
    }

    onAfterEvent = resolveSpecialEventFn(
      currentState.name,
      `onAfter${eventName}`
    );

    if (isFun(onAfterEvent)) {
      onAfterEvent.call(
        stateStore,
        eventName,
        currentState.name,
        nextState.name
      );
    }

    stateStore.setMachineState(nextState, eventName);

    return eventValue;
  };

  for (let stateName in statesObject) {
    stateStore[stateName] = statesObject[stateName];

    for (let eventName in stateStore[stateName]) {
      if (isStr(stateStore[stateName][eventName])) {
        const itemEventName = stateStore[stateName][eventName];
        stateStore[stateName][eventName] = obj => obj[itemEventName];
        stateMachine[eventName] = transition.bind(
          null,
          stateName,
          eventName,
          stateMachine[eventName]
        );
      }
    }

    stateStore[stateName].name = stateName;

    currentState = currentState || stateStore[stateName];
  }

  return stateMachine;
}

export default arg => new Stately(arg);
