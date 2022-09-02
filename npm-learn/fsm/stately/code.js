const isType = (arg, type) => arg && typeof arg === type;

function Stately(statesObject, initialStateName) {
  if (isType(statesObject, "function")) statesObject = statesObject();

  let currentState;

  const resolveSpecialEventFn = (stateName, fnName) => {
    for (var property in stateStore[stateName]) {
      if (stateStore[stateName].hasOwnProperty(property)) {
        if (property.toLowerCase() === fnName.toLowerCase()) {
          return stateStore[stateName][property];
        }
      }
    }
  };

  const stateStore = {
    getMachineState: function getMachineState() {
      return currentState.name;
    },

    setMachineState: function setMachineState(nextState /* , eventName */) {
      var eventName = arguments[1];
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

    getMachineEvents: function getMachineEvents() {
      var events = [];

      for (var property in currentState) {
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
    currentState,
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
          }

          if (
            isType(stateStore[stateName][eventName], "function") &&
            !/^onEnter$/i.test(eventName) &&
            !/^onLeave$/i.test(eventName) &&
            !/^onBefore/i.test(eventName) &&
            !/^onAfter/i.test(eventName)
          ) {
            stateMachine[eventName] = transition(
              stateName,
              eventName,
              stateMachine[eventName]
            );
          }
        }
      }

      stateStore[stateName].name = stateName;

      if (!currentState) {
        currentState = stateStore[stateName];
      }
    }
  }

  if (typeof stateStore[initialStateName] !== "undefined") {
    currentState = stateStore[initialStateName];
  }

  return stateMachine;
}

Stately.machine = function machine(statesObject, initialStateName) {
  return new Stately(statesObject, initialStateName);
};

export default Stately;
