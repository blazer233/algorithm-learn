// 支持重试的函数
const asyncReTryFunc = (asyncFunc, times) => {
  return new Promise((resolve, reject) => {
    const reTryFunc = async (time = 0) => {
      console.log(`第${time}次重试`);
      asyncFunc()
        .then(res => resolve(res))
        .catch(err => {
          if (time < times) {
            time++;
            setTimeout(() => reTryFunc(time), 500);
          } else {
            reject(err);
          }
        });
    };
    reTryFunc();
  });
};
