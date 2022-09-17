type Tstate = { base: any, copy: any }
type Tproduce = <T = any>(baseState: T, recipe: (draft: T) => any) => T
const keyForState = Symbol('key-for-state');


const createProxy = (value: any): any => {
  const state: Tstate = { base: value, copy: null }
  const proxy = new Proxy(state, {
    set(state: Tstate, prop: string, v: any) {
      state.copy = state.copy ?? { ...state.base };
      state.copy[prop] = v;
      return true;
    },
    get(state: Tstate, prop: string | symbol) {
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

const produce: Tproduce = (baseState, recipe) => {
  const proxy = createProxy(baseState);
  recipe(proxy);
  return readresult(proxy);
}

export default produce;