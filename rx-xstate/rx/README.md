# 实现一个rxjs（Observable）🎅

![image.webp](https://raw.githubusercontent.com/blazer233/algorithm-learn/main/rx-xstate/rx/title.webp)

> 项目代码：https://github.com/blazer233/algorithm-learn/tree/main/rx-xstate/rx
>
>
> 参考轮子：https://github.com/ReactiveX/rxjs


依照 RxJS 的官方定义:

> RxJS 是使用 Observables 的响应式编程的库，它使编写异步或基于回调的代码更容易

针对 JavaScript 中的非阻塞行为（non-blocking manner），RxJS in Action（Deniels, P.P etc.）列举了 3 种处理方式，包括回调函数（callback functions）、事件派发器（Event Emitters）以及Promise。

`RxJS` 则提出了一种新的思维方式：数据流，它通过`observable`序列来实现基于事件的编程，它使编写异步或基于回调的代码更容易。且代码量会有效减少，可读性的提高。本文通过挖掘精简rxjs源码，力求实现一个tony版的rxjs，用简单的demo深入浅出理解rxjs的核心思想。

### 举个例子：

通过伪代码，实现一个简单的滚动下拉加载：

![image.webp](https://raw.githubusercontent.com/blazer233/algorithm-learn/main/rx-xstate/rx/2.png)

上述代码，我们可以看出来几点问题:

1. 两个异步行为（`fetch`请求事件、页面滚动事件），两个异步事件的处理显得很冗余，且不容易阅读
2. 我们要使用 `flag` 去判断状态（`isRequesting` 判断上一个请求是否已经处理完成）
3. 如果我们需要判断请求的次数，还需要更多的 `flag` 在外层来记录

rxjs方式：

![image.webp](https://raw.githubusercontent.com/blazer233/algorithm-learn/main/rx-xstate/rx/1.png)

配合操作符（`operator`），提高了每一步操作的可读性，将事件转换成（`Observable`）通过流的方式进行监听并处理，并且在处理业务逻辑时，可以将每一步拆成更小的函数，通过更多的`operator`连接，提高业务代码的复用性和可读性，这也是`RxJS`的精髓所在。


下面切入正题，RxJS 官方文档罗列了几个核心概念，分别是：

> 1. Observable (可观察对象): 表示一个概念，这个概念是一个可调用的未来值或事件的集合。
> 2. Observer (观察者): 一个回调函数的集合，它知道如何去监听由 Observable 提供的值。
> 3. Subscription (订阅): 表示 Observable 的执行，主要用于取消 Observable 的执行。
> 4. Operators (操作符): 采用函数式编程风格的纯函数 (pure function)，使用像 map、filter、concat、flatMap 等这样的操作符来处理集合。
> 5. Subject (主体): 相当于 EventEmitter，并且是将值或事件多路推送给多个 Observer 的唯一方式。
> 6. Schedulers (调度器): 用来控制并发并且是中央集权的调度员，允许我们在发生计算时进行协调，例如 setTimeout 或 requestAnimationFrame 或其他。

接下来，我们首先来实现 RxJS 框架中核心的核心 —— Observable

### Observable：

在我们实现的tony版RxJS中，需要跑通下面的Demo

```js
import { Observable } from 'rxjs';

// Create a lazy Push System
const observable = new Observable(observer => {
    observer.next(1);
    observer.next(2);
    observer.next(3);
    observer.complete();
});

// Subscribe the lazy Push System
observable.subscribe({
    next: (value: number) => console.log('we got', value);
    error: (error: any) => console.error(error);
    complete: () => console.log('completed');
});

/**
 * Output:
 * we got 1
 * we got 2
 * we got 3
 * completed
 */

```

在`RxJS`中`Observable`是可以被订阅（subscribe）的一个流对象，而`observer`是订阅`Observable`的物件，理解这两者的区别和联系是很重要的

在上述Demo中`observer`的方法有：

- observer.next(value)：类似于promise的then，表示接下来的传入或操作
- observer.complete(value)：表示观察者对象的流结束，complete()触发后，next将不再起作用

通常subscribe对象中仅传入一个函数的时候视为next函数执行。

在 JavaScript 中，每一个函数都是一个 [lazy Pull](https://rxjs.dev/guide/observable) 系统，只有我们订阅 Observable，我们才可以拿到我们需要的数据。执行订阅的函数

#### 实现Observable

通过Demo，我们发现:

1. `Observable`是一个入参为函数的构造函数
2. `Observable`的入参函数会拿到`observer`作为参数
3. `Observable`原型链上存在`subscribe`函数，作为订阅的开关

那么可以实现如下代码：

```js
export class Observable {
  constructor(subscribe) {
    if (subscribe) this._subscribe = subscribe;
  }

  subscribe(observerOrNext) {
    const subscriber = observerOrNext instanceof Subscriber
      ? observerOrNext
      : new SafeSubscriber(observerOrNext, error, complete);
    subscriber.add(this._subscribe(subscriber));
    return subscriber;
  }
}

```
> [源码](https://github.com/ReactiveX/rxjs/blob/master/src/internal/Observable.ts#L35)

在如上代码里 new 实例化`Observable`对象，其传入参数对内部方法`_subscribe`进行了重写，之后在调用`subscribe`时，将订阅函数转编为`Subscriber`的实例对象

此时就有小伙伴纳闷了，`Subscriber`是个什么鬼？？？
![image.webp](https://raw.githubusercontent.com/blazer233/algorithm-learn/main/rx-xstate/rx/wen.png)

我们这里先关注`Observable`的实现，不要急哈，subscibe方法接受三个可选参数，如下图（也可点击源码链接查看）

```js
...
   subscribe(
        observerOrNext?: Partial<Observer<T>> | ((value: T) => void) | null,
        error?: ((error: any) => void) | null,
        complete?: (() => void) | null
    ): Subscription {...}
```

`error`和`complete`参数没有传，暂时无需关注，对于`observerOrNext`接口中定义了三种类型，分别是`Observer<T>`对象，函数`(value: T) => void`和空值`null` 
[源码](https://github.com/ReactiveX/rxjs/blob/master/src/internal/Observable.ts#L214)


subscribe方法真正需要的是`Subscriber`实例对象，所以一开始调用方法进行判断，是否是`Subscriber`的实例对象，如果不是就会将我们传入的对象（包含 next、error 和 complete 函数）重新进行处理，使得其拥有添加订阅，取消订阅的功能（add、unsubscribe）

#### SafeSubscriber

`SafeSubscriber`简单继承于 `Subscriber`，而`Subscriber`方法也是对入参`observerOrNext`进行了又一层封装，本质还是继承了`Subscription`方法，add、unsubscribe等核心方法最终是挂载在`Subscription`上

稍后看，不要急哈![image.webp](https://raw.githubusercontent.com/blazer233/algorithm-learn/main/rx-xstate/rx/fo.png)

```js
export class SafeSubscriber extends Subscriber {
  constructor(observerOrNext, error, complete) {
    super();
    this.destination = new Observer(observerOrNext, error, complete, this);
  }
}
```
[源码](https://github.com/ReactiveX/rxjs/blob/master/src/internal/Subscriber.ts#L193)


#### Observer

Observer 中对传入的`observerOrNext`上 `next`、`error`、`complete` 三个方法属性进行了一层封装，保证能够更好地进行错误处理

```js
/**
 * 创建空异常
 * @returns
 */
export function defaultErrorHandler(err) {
  throw err;
}

/**
 * 创建空函数
 * @returns
 */
export function noop() {
  return function () {};
}

export class Observer {
  constructor(observerOrNext, error, complete, context) {
    if (observerOrNext instanceof Observer) {
      error = observerOrNext.error;
      complete = observerOrNext.complete;
      observerOrNext = observerOrNext.next;
    }
    this.next = observerOrNext ? observerOrNext.bind(context) : noop;
    this.error = (error || defaultErrorHandler).bind(context);
    this.complete = complete ? complete.bind(context) : noop;
  }
}
```

#### Subscriber

Observer 中对传入的`observerOrNext`上 `next`、`error`、`complete` 三个方法属性进行了一层封装，保证能够更好地进行错误处理


```js
class Subscriber extends Subscription {
  isStopped = false;
  destination = null;
  constructor(destination) {
    super();
    if (destination) {
      this.destination = destination;
      if (destination instanceof Subscription) {
        destination.add(this);
      }
    } else {
      this.destination = EMPTY_OBSERVER;
    }
  }

  next(value) {
    if (!this.isStopped) {
     this.destination.next(value, id);
    }
  }

  unsubscribe() {
    if (!this.closed) {
      this.isStopped = true;
      super.unsubscribe();
      this.destination = null;
    }
  }

  complete() {
    if (!this.isStopped) {
      this.isStopped = true;
      try {
        this.destination.complete();
      } finally {
        this.unsubscribe();
      }
    }
  }
}
```



## 总结

这个 `fsm有限状态机` 主要完成了：

1. 状态的可观测
2. 状态的链式调用
3. 状态变化的钩子函数

以上就是 npm 包 [stately](https://github.com/fschaefer/Stately.js) 的源码学习。
