function create(setter) {
  let state;
  const listeners = new Set();

  const set = newState => {
    state = newState;
    listeners.forEach(listener => listener(state));
  };

  const getState = () => state;

  const subscribe = listener => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const store = {
    getState,
    subscribe,
  };

  setter(set);
  return store;
}

// 使用
const store = create(set => {
  set({ count: 0 });
});

store.subscribe(state => {
  console.log(`count is ${state.count}`);
});

store.getState().count = 1; // 输出 "count is 1"
