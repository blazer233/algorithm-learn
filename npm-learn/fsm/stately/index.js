const isType = (arg, type) => arg && typeof arg === type;

function Stately(statesObject) {
  if (isType(statesObject, "function")) statesObject = statesObject();
  let currentState;

  const resolveSpecialEventFn = (stateName, fnName) => {
    debugger;
    for (var property in stateStore[stateName]) {
      if (stateStore[stateName].hasOwnProperty(property)) {
        if (property.toLowerCase() === fnName.toLowerCase()) {
          return stateStore[stateName][property];
        }
      }
    }
  };

  const stateStore = {
    getMachineState() {
      return currentState.name;
    },

    setMachineState(nextState, eventName) {
      var onEnterState;
      var onLeaveState;
      var lastState = currentState;

      if (typeof nextState === "string") {
        nextState = stateStore[nextState];
      }

      currentState = nextState;

      onLeaveState = resolveSpecialEventFn(lastState.name, "onLeave");

      if (
        onLeaveState &&
        typeof onLeaveState === "function" &&
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
        typeof onEnterState === "function" &&
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
      var events = [];
      for (const property in currentState) {
        if (currentState.hasOwnProperty(property)) {
          if (isType(currentState[property], "function")) {
            events.push(property);
          }
        }
      }
      return events;
    },
  };
  const stateMachine = {
    getMachineState: stateStore.getMachineState,
    getMachineEvents: stateStore.getMachineEvents,
  };

  const transition = (stateName, eventName, nextEvent) => {
    return () => {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      var onBeforeEvent;
      var onAfterEvent;
      var nextState;
      var eventValue = stateMachine;

      if (stateStore[stateName] !== currentState) {
        if (nextEvent) {
          eventValue = nextEvent.apply(stateStore, args);
        }

        return eventValue;
      }

      onBeforeEvent = resolveSpecialEventFn(
        currentState.name,
        `onBefore${eventName}`
      );

      if (isType(onBeforeEvent, "function")) {
        onBeforeEvent.call(
          stateStore,
          eventName,
          currentState.name,
          currentState.name
        );
      }

      eventValue = stateStore[stateName][eventName].apply(stateStore, args);

      if (!eventValue) {
        nextState = currentState;

        eventValue = stateMachine;
      } else if (isType(eventValue, "string")) {
        nextState = stateStore[eventValue];

        eventValue = stateMachine;
      } else if (Array.isArray(eventValue)) {
        if (!eventValue[0]) {
          nextState = currentState;
        } else if (isType(eventValue[0], "string")) {
          nextState = stateStore[eventValue[0]];
        } else {
          nextState = eventValue[0];
        }

        eventValue = eventValue[1] || stateMachine;
      } else if (isType(eventValue, "object")) {
        nextState = eventValue === stateStore ? currentState : eventValue;

        eventValue = stateMachine;
      }

      onAfterEvent = resolveSpecialEventFn(
        currentState.name,
        `onAfter${eventName}`
      );

      if (isType(onAfterEvent, "function")) {
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
  };

  for (var stateName in statesObject) {
    if (statesObject.hasOwnProperty(stateName)) {
      stateStore[stateName] = statesObject[stateName];

      for (var eventName in stateStore[stateName]) {
        if (stateStore[stateName].hasOwnProperty(eventName)) {
          if (typeof stateStore[stateName][eventName] === "string") {
            const itemEventName = stateStore[stateName][eventName];
            stateStore[stateName][eventName] = obj => obj[itemEventName];

            stateMachine[eventName] = transition(
              stateName,
              eventName,
              stateMachine[eventName]
            );
          }
        }
      }

      stateStore[stateName].name = stateName;

      currentState = currentState || stateStore[stateName];
    }
  }

  return stateMachine;
}

export default arg => new Stately(arg);
