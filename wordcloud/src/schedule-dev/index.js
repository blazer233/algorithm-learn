/**
 *
 * @param {*} handle 进行检测碰撞并绘制的函数
 */
export default handle => {
  const exec = [];
  return {
    add(task) {
      exec.push(task);
    },
    run() {
      const RUNTIME = 16;
      const { port1, port2 } = new MessageChannel();
      let isAbort = false;
      const promise = new Promise((resolve, reject) => {
        const runner = () => {
          const prevTime = performance.now();
          do {
            if (isAbort) {
              return reject(exec);
            }
            if (!exec.length) {
              return resolve(exec);
            }
            const task = exec.shift();
            handle(...task);
          } while (performance.now() - prevTime < RUNTIME);
          port2.postMessage("");
        };
        port1.onmessage = function () {
          runner();
        };
        port2.postMessage("");
      });
      promise.abort = () => {
        isAbort = true;
      };
      return promise;
    },
  };
};
