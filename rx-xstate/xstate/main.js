import { createMachine, interpret } from "./xstate-fsm/core";

const lightMachine = createMachine({
  id: "light",
  initial: "green",
  states: {
    green: {
      on: {
        TIMER: "yellow",
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
const nextState = lightMachine.transition("green", "TIMER").value;
console.log(nextState);

const toggleMachine = createMachine({});

const toggleService = interpret(toggleMachine).start();

toggleService.subscribe(state => {
  console.log(state.value);
});

toggleService.send("TOGGLE");
toggleService.send("TOGGLE");
toggleService.stop();
