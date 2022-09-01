# 使用js实现一个高级的sleep方法

![](https://camo.githubusercontent.com/73989ab636e289aea3435248f9a9ce571c7e39f81a47ba02f176b68411167e56/68747470733a2f2f7777772e62696e672e636f6d2f74683f69643d4f48522e426c75654c696e636b69615f454e2d5553373037383738373133335f3139323078313038302e6a70672672663d4c6144696775655f3139323078313038302e6a7067267069643d6870)

> 项目代码：https://github.com/Haixiang6123/my-promise-poller
>
>
> 参考轮子：https://github.com/sindresorhus/delay


很多编程语言里都有sleep()，delay()等方法，它能让我们的程序不那么着急的去执行下一步操作，而是延迟、等待一段时间。软件开发中经常会遇到需要这样的函数，比如等待几分钟去检查某一事件是否发生。JavaScript里有setTimeout()方法来实现设定一段时间后执行某个任务，但写法很丑陋，功能也很单一，需要提供回调函数，

```js
const createDelay = setTimeout
```

## 从零开始

先从上面说的 `createDelay` 的方法开始写起，借助 Promise，我们可以对setTimeout函数进行改良，下面就是把setTimeout()封装成一个返回Promise的sleep()函数：

```js
const createDelay =(ms)=>new Promise((resolve) => setTimeout(resolve, ms))

// 用法
// sleep(500).then(() => {
//     这里写sleep之后需要去做的事情
// })
```

这种写法很优雅，很像其它编程语言里的延迟、等待函数。`Promise API` 使我们避免传入回调函数，我们在实现中还使用了ES6中的箭头(arrow)函数，但是这样仅仅是满足了最基本的需求，在实际场景中，我们需要对定时器进行清除，否则会造成内存泄露的问题

```js
const createDelay = (ms) => {
  let timeoutId;
  const delayPromise = new Promise(resolve => {
      timeoutId = setTimeout(resolve, ms);
    });
  delayPromise.clear = () => clearTimeout(timeoutId)
  return delayPromise;
}

```
此时我们已经实现了对定时器的清除，那么如果我想预先添加参数，在 `.then()` 的时候直接获取，就需要将参数封成 `Options` 类型，预先传入

```js
const createDelay = (ms, { value }) => {
  let timeoutId;
  const delayPromise = new Promise(resolve => {
      timeoutId = setTimeout(() => resolve(value), ms);
    });
  delayPromise.clear = () => clearTimeout(timeoutId)
  return delayPromise;
}
```

## HOC

这样的代码我们还是不满意，因为我们 `Promise` 的时候只能 `resolve` ，并不能进行 `reject` ，所以我们对 `createDelay` 函数进行一层包装，返回一个高阶函数，将是否进行 `reject` 的权利交给使用者

并且在使用者提前手动清除 `delay` 函数时，执行 `delay` 函数

```js
const createDelay = (options) => {
  const { willResolve } = options
  return (ms, { value }) => {
    let timeoutId;
    let settle;
    const delayPromise = new Promise((resolve, reject) => {
        settle = () => {
          if (willResolve) {
            resolve(value);
          } else {
            reject(value);
          }
        };
      timeoutId = setTimeout(settle, ms);
    });
    delayPromise.clear = () => {
      clearTimeout(timeoutId)
      settle();
    }
    return delayPromise;
  }
}

const createWithTimers = () => {
  const delay = createDelay({ willResolve: true });
  delay.reject = createDelay({ willResolve: false });
  return delay;
};
const delay = createWithTimers();
```

是不是功能强大了起来？


在实际的工作场景中，由于网络请求有不可预测的性能。例如，如果有一个请求消耗的时间不应超过一定的时间，我们只希望在 最快ms~最长ms 中间去执行，那就需要一个 `range` 时间范围去计算需要延时的时间，

```js
const createDelay = (options) => {
  ...
}

const randomInteger = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const createWithTimers = () => {
  const delay = createDelay({ willResolve: true });
  delay.reject = createDelay({ willResolve: false });
  delay.range = (min, max, options) => delay(randomInteger(min, max), options);
  return delay;
};
const delay = createWithTimers();
```

在程序运行中，我们有可能会被 `fake-timers` 所影响，导致 `clearTimeout` 和 `setTimeout` 的使用异常，此时我们可以将定时器的对应方法暴露出去，在 `delay` 上面添加一个新的方法`createWithTimers` 创造一个新的 `delay` ，通过外部传入的方式解决这个问题

> fake-timers：https://github.com/sinonjs/fake-timers
> 伪造 `setTimeout`

```js
const createDelay = (options) => {
  const {
    clearTimeout: clear = clearTimeout,
    setTimeout: set = setTimeout,
    willResolve,
  } = options;
  return (ms, { value }) => {
    let timeoutId;
    let settle;
    const delayPromise = new Promise((resolve, reject) => {
        settle = () => {
          if (willResolve) {
            resolve(value);
          } else {
            reject(value);
          }
        };
      timeoutId = set(settle, ms);
    });
    delayPromise.clear = () => {
      clear(timeoutId)
      settle();
    }
    return delayPromise;
  }
}

const randomInteger = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const createWithTimers = clearAndSet => {
  const delay = createDelay({ ...clearAndSet, willResolve: true });
  delay.reject = createDelay({ ...clearAndSet, willResolve: false });
  delay.range = (min, max, options) => delay(randomInteger(min, max), options);
  return delay;
};
const delay = createWithTimers();
delay.createWithTimers = createWithTimers;

// 使用：

const customDelay = delay.createWithTimers({clearTimeout, setTimeout});

(async() => {
	const result = await customDelay(100, {value: '🦄'});

	// Executed after 100 milliseconds
	console.log(result);
	//=> '🦄'
})();

```

以上的实现已经能覆盖所有的情况了，但有时我们如果想利用 `AbortController` 的特性，在 `delay` 结束时间没到之前，提前终止，并进行异常捕获，就需要对 `createDelay` 方法进行改造，


> AbortController：https://developer.mozilla.org/zh-CN/docs/Web/API/AbortController
> 

我们在调用时的 `options` 中加入 `signal`，传入 `AbortController` 的signal属性：


> AbortController.signal：返回一个 AbortSignal 对象实例，它可以用来 with/abort 一个 Web（网络）请求。

```js
(async () => {
	const abortController = new AbortController();

	setTimeout(() => {
		abortController.abort();
	}, 500);

	try {
		await delay(1000, {signal: abortController.signal});
	} catch (error) {
		// 500 milliseconds later
		console.log(error.name)
		//=> 'AbortError'
	}
})();
```

此时我们需要一个可以抛出异常的方法

```js
const createAbortError = () => {
  const error = new Error("Delay aborted");
  error.name = "AbortError";
  return error;
};
```

> AbortController.abort()：中止一个尚未完成的 Web（网络）请求。这能够中止 fetch 请求及任何响应体的消费和流

在 `createDelay` 中对 `signal.aborted` 进行检测，如果存在则通过 `Promise.reject` 进行抛出


```js
const createDelay = (options) => {
  const {
    clearTimeout: clear = clearTimeout,
    setTimeout: set = setTimeout,
    willResolve,
  } = options;
  return (ms, { value, signal}) => {
    let timeoutId;
    let settle;
    if (signal && signal.aborted) return Promise.reject(createAbortError());

    const delayPromise = new Promise((resolve, reject) => {
      ...
    });
    delayPromise.clear = () => {
      ...
    }
    return delayPromise;
  }
}
```

同时在 `signal` 存在的时候，通过 `signal.addEventListener` 添加 `abort` 事件的监听，如果存在 `abort` 事件则中断 `delay` ，并且通过 `reject` 将异常进行抛出

```js
const createDelay = (options) => {
  const {
    clearTimeout: clear = clearTimeout,
    setTimeout: set = setTimeout,
    willResolve,
  } = options;
  return (ms, { value, signal}) => {
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

    if (signal){
          signal.addEventListener("abort", signalListener, { once: true });
    }

    delayPromise.clear = () => {
      clear(timeoutId);
      settle();
    }
    return delayPromise;
  }
}
```


上面对于 `signal` 的处理一共完成了三步：

1. 如果 `signal.aborted` 被调用则立刻通过`createAbortError()`抛出异常
2. 如果 `signal` 存在则添加监听事件，`aborted` 被调用时销毁定时器，抛出异常
3. 定时器执行完毕之后，如果 `signal` 存在，移除 `abort` 事件监听


## 总结

这个 `delay` 主要完成了：

1. 基础的延时执行功能
2. 返回 promise
3. 提供主动reject功能
4. 提供预先传参功能
5. 提供定时器主动清除功能
6. 提供自定义定时器功能，避免被 `fake-timers` 等库的干扰
7. 兼容了 `AbortController` 的处理

以上就是 npm 包 [delay](https://github.com/sindresorhus/delay) 的源码实现了。
