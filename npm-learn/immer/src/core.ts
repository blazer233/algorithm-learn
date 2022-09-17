const keyForState = Symbol('key-for-state');
type state = { base: any, copy: any }

const createProxy = (value: any): any => {
  const state: state = { base: value, copy: null }
  const proxy = new Proxy(state, {
    set(state: state, prop: string, v: any) {
      state.copy = state.copy ?? { ...state.base };
      state.copy[prop] = v;
      return true;
    },
    get(state: state, prop: string | symbol) {
      if (prop === keyForState) return state;
      state.copy = state.copy ?? { ...state.base };
      return (state.copy[prop] = createProxy(state.copy[prop]));
    }
  });

  return proxy;
}

const readresult = (draft: any) => {
  const isDraft = (source: any) => !!source && !!source[keyForState]
  const state = draft[keyForState];
  for (let key in state.copy) {
    if (isDraft(state.copy[key])) {
      state.copy[key] = readresult(state.copy[key]);
    }
  }
  return state.copy;
}

const produce: <T = any>(baseState: T, recipe: (draft: T) => any) => T = (baseState, recipe) => {
  const proxy = createProxy(baseState);
  recipe(proxy);
  return readresult(proxy);
}

export default produce;