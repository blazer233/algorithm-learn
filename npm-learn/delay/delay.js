const randomInteger = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);
const createAbortError = () => {
  const error = new Error("Delay aborted");
  error.name = "AbortError";
  return error;
};
const createDelay = options => {
  const {
    clearTimeout: clear = clearTimeout,
    setTimeout: set = setTimeout,
    willResolve,
  } = options;
  return (ms, { value, signal } = {}) => {
    if (signal && signal.aborted) return Promise.reject(createAbortError());
    let timeoutId;
    let settle;
    let rejectFn;

    const signalListener = () => {
      clear(timeoutId);
      rejectFn(createAbortError());
    };

    const cleanup = () => {
      if (signal) {
        signal.removeEventListener("abort", signalListener);
      }
    };
    const delayPromise = new Promise((resolve, reject) => {
      settle = () => {
        cleanup();
        if (willResolve) {
          resolve(value);
        } else {
          reject(value);
        }
      };
      rejectFn = reject;
      timeoutId = set(settle, ms);
    });
    if (signal)
      signal.addEventListener("abort", signalListener, { once: true }); // true表示事件在触发一次后移除

    delayPromise.clear = () => {
      clear(timeoutId);
      settle();
    };
    return delayPromise;
  };
};
const createWithTimers = clearAndSet => {
  const delay = createDelay({ ...clearAndSet, willResolve: true });
  delay.reject = createDelay({ ...clearAndSet, willResolve: false });
  delay.range = (min, max, options) => delay(randomInteger(min, max), options);
  return delay;
};
const delay = createWithTimers();
delay.createWithTimers = createWithTimers;
