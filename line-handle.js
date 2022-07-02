// 串行请求
const serial = ajaxArr =>
  ajaxArr.reduce((pre, cur) => pre.then(() => cur()), Promise.resolve());
// 实现pipe
const pipe = (...fnc) =>arg => fnc.reduce((acc, fn) => fn(acc), arg);
// 实现防止重复发送请求
const firstPromise = (fn, p = null) => (...arg) => p ? p : (p = fn(...arg).finally(() => (p = null)));
// 实现PromiseAll
const PromiseAll = (arr, ret = []) =>
  new Promise((resolve, reject) => {
    arr.forEach((i, idx) =>
      Promise.resolve(i)
        .then(res => (ret[idx] = res))
        .catch(err => reject(err))
    );
    resolve(ret);
  });
// 实现PromiseRace
const promiseRace = arr =>
  new Promise((resolve, reject) =>
    arr.forEach(i =>
      Promise.resolve(i)
        .then(res => resolve(res))
        .catch(err => reject(err))
    )
  );
