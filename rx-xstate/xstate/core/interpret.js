import { INIT_EVENT } from "./util";

const InterpreterStatus = {
  NotStarted: 0,
  Running: 1,
  Stopped: 2,
};

function executeStateActions(state, context, event, eventData) {
  const copyContext = Object.assign({}, context);
  for (const i in state.actions) {
    if (typeof state.actions[i] == "function") {
      state.actions[i]({ context: copyContext, event, detail: eventData });
    }
  }
}

class InterpretService {
  constructor(machine, comInstance) {
    this.state = machine.initialState;
    this.status = InterpreterStatus.NotStarted;
    this.machine = machine;
    this.comInstance = comInstance;
  }

  start() {
    this.status = InterpreterStatus.Running;
    executeStateActions(this.state, this.comInstance.data, INIT_EVENT);
  }

  stop() {
    this.status = InterpreterStatus.Stopped;
    this.machine.dispose();
    this.machine = null;
    this.comInstance = null;
  }

  send(event, eventData) {
    if (this.status !== InterpreterStatus.Running) return;
    this.state = this.machine.transition(this.state, event, eventData);
    executeStateActions(this.state, this.comInstance.data, event, eventData);
    return this.state;
  }
}

export function interpret(machine, comInstance) {
  return new InterpretService(machine, comInstance);
}
