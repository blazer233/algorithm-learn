// https://cloud.tencent.com/developer/article/1956461
import {
  valueEnumerable,
  valueEnumerableWritable,
  identity,
  truthy,
  callBoth,
  create,
  callForward,
  filter,
} from "./tools";

const transitionType = {};
const immediateType = {};

function createMachine(current, states = {}, contextFn = {}) {
  if (typeof current !== "string") {
    contextFn = states;
    states = current;
    [current] = Object.keys(states);
  }
  return create(machine, {
    context: valueEnumerable(contextFn),
    current: valueEnumerable(current),
    states: valueEnumerable(states),
  });
}

function stack(fns, def, caller) {
  return fns.reduce(
    (par, fn) =>
      function (...args) {
        return caller(par, fn, this, args);
      },
    def
  );
}

function fnType(fn) {
  return create(this, { fn: valueEnumerable(fn) });
}

const reduceType = {};

const guardType = {};

function makeTransition(from, to, ...args) {
  const guards = stack(
    filter(args, guardType).map(t => t.fn),
    truthy,
    callBoth
  );
  const reducers = stack(
    filter(args, reduceType).map(t => t.fn),
    identity,
    callForward
  );
  return create(this, {
    from: valueEnumerable(from),
    to: valueEnumerable(to),
    guards: valueEnumerable(guards),
    reducers: valueEnumerable(reducers),
  });
}

function enterImmediate(machine, service, event) {
  return transitionTo(service, machine, event, this.immediates) || machine;
}

function transitionsToMap(transitions) {
  const m = new Map();
  for (const t of transitions) {
    if (!m.has(t.from)) m.set(t.from, []);
    m.get(t.from).push(t);
  }
  return m;
}

const stateType = { enter: identity };

function state(...args) {
  const transitions = filter(args, transitionType);
  const immediates = filter(args, immediateType);
  const transMap = transitionsToMap(transitions);
  const desc = {
    final: valueEnumerable(args.length === 0),
    transitions: valueEnumerable(transMap),
  };
  if (immediates.length) {
    desc.immediates = valueEnumerable(immediates);
    desc.enter = valueEnumerable(enterImmediate);
  }
  return create(stateType, desc);
}

const invokePromiseType = {
  enter(machine, service, event) {
    this.fn
      .call(service, service.context, event)
      .then(data => service.send({ type: "done", data }))
      .catch(error => service.send({ type: "error", error }));
    return machine;
  },
};
const invokeMachineType = {
  enter(machine, service, event) {
    service.child = interpret(
      this.machine,
      s => {
        service.onChange(s);
        if (service.child == s && s.machine.state.value.final) {
          delete service.child;
          service.send({ type: "done", data: s.context });
        }
      },
      service.context,
      event
    );
    if (service.child.machine.state.value.final) {
      const data = service.child.context;
      delete service.child;
      return transitionTo(
        service,
        machine,
        { type: "done", data },
        this.transitions.get("done")
      );
    }
    return machine;
  },
};
function invoke(fn, ...transitions) {
  const t = valueEnumerable(transitionsToMap(transitions));
  return machine.isPrototypeOf(fn)
    ? create(invokeMachineType, {
        machine: valueEnumerable(fn),
        transitions: t,
      })
    : create(invokePromiseType, {
        fn: valueEnumerable(fn),
        transitions: t,
      });
}

const machine = {
  get state() {
    return {
      name: this.current,
      value: this.states[this.current],
    };
  },
};

function transitionTo(service, machine, fromEvent, candidates) {
  const { context } = service;
  for (const { to, guards, reducers } of candidates) {
    if (guards(context, fromEvent)) {
      service.context = reducers.call(service, context, fromEvent);

      const original = machine.original || machine;
      const newMachine = create(original, {
        current: valueEnumerable(to),
        original: { value: original },
      });
      const state = newMachine.state.value;
      return state.enter(newMachine, service, fromEvent);
    }
  }
}

function send(service, event) {
  const eventName = event.type || event;
  const { machine } = service;
  const { value: state, name: currentStateName } = machine.state;

  if (state.transitions.has(eventName)) {
    return (
      transitionTo(service, machine, event, state.transitions.get(eventName)) ||
      machine
    );
  }
  return machine;
}

const service = {
  send(event) {
    this.machine = send(this, event);

    // TODO detect change
    this.onChange(this);
  },
};

function interpret(machine, onChange, initialContext, event) {
  const s = Object.create(service, {
    machine: valueEnumerableWritable(machine),
    context: valueEnumerableWritable(machine.context(initialContext, event)),
    onChange: valueEnumerable(onChange),
  });
  s.send = s.send.bind(s);
  s.machine = s.machine.state.value.enter(s.machine, s, event);
  return s;
}

export default {
  interpret,
  createMachine,
  invoke,
  state,
  action: fn => reduce((ctx, ev) => !!~fn(ctx, ev) && ctx),
  transition: makeTransition.bind(transitionType),
  immediate: makeTransition.bind(immediateType, null),
  guard: fnType.bind(guardType),
  reduce: fnType.bind(reduceType),
};
