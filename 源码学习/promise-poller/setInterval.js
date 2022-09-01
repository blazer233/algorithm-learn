const promisePoller = (task, interval, options) => {
  let {
    timeout, // 单个任务最长执行时间
    masterTimeout, // 所有任务最长执行时间
    progressCallback, // 处理失败的轮询
    checkRet, // 是否检测返回值
    shouldContinue = (err, res) => !err && res, // 当次轮询后是否需要继续
    retries = 5, // 轮询任务失败后重试次数
  } = options;
  let polling = true;
  let AllTimeoutId; // null | number
  let rejections = []; // 记录出错的轮询
  const M_TIMEOUT = "Mast timeout";
  const T_TIMEOUT = "Task timeout";
  const CANCEL = "CANCEL_TOKEN";
  const delay = time => new Promise(resolve => setTimeout(resolve, time));
  const handleAllTimeout = rej => {
    AllTimeoutId = setTimeout(() => {
      rej(new Error(M_TIMEOUT));
      polling = false;
    }, masterTimeout);
  };
  const handleTaskTimeout = (promise, interval) => {
    return new Promise((resolve, reject) => {
      const id = setTimeout(() => reject(new Error(T_TIMEOUT)), interval);
      promise.then(result => {
        clearTimeout(id);
        resolve(result);
      });
    });
  };
  return new Promise((resolve, reject) => {
    if (masterTimeout) handleAllTimeout(reject);
    const poll = () => {
      let taskResult = task();
      if (!taskResult && checkRet) {
        taskResult = Promise.reject(taskResult);
        reject(CANCEL);
        polling = false;
      }
      let taskPromise = Promise.resolve(taskResult);
      if (timeout) {
        taskPromise = handleTaskTimeout(taskPromise, timeout);
      }
      taskPromise
        .then((res = {}) => {
          if (shouldContinue(null, res) && polling) {
            delay(interval).then(poll);
          } else {
            clearTimeout(AllTimeoutId);
            resolve(res);
          }
        })
        .catch(error => {
          console.log(error, "error");
          if (error === CANCEL && checkRet) {
            polling = false;
            reject(rejections);
          }
          rejections.push({ retries, error });
          if (progressCallback) progressCallback(retries, error);
          retries -= 1;
          // 重试次数用完或者不再继续时
          if (!retries || !shouldContinue(true)) {
            polling = false;
            reject(rejections);
          }
          if (polling) delay(interval).then(poll);
        });
    };
    poll();
  });
};
