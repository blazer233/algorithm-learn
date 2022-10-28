# 【硬核拆解】从源码实现一个rxjs（Observable篇）

![image.webp](https://raw.githubusercontent.com/blazer233/algorithm-learn/main/rx-xstate/rx/title.webp)

> 项目代码：https://github.com/blazer233/algorithm-learn/tree/main/rx-xstate/rx
>
>
> 参考轮子：https://github.com/ReactiveX/rxjs


依照 RxJS 的官方定义:

> RxJS 是使用 Observables 的响应式编程的库，它使编写异步或基于回调的代码更容易

针对 JavaScript 中的非阻塞行为（non-blocking manner），RxJS in Action（Deniels, P.P etc.）列举了 3 种处理方式，包括回调函数（callback functions）、事件派发器（Event Emitters）以及Promise。

`RxJS` 则提出了一种新的思维方式：数据流，它通过`observable`序列来实现基于事件的编程，它使编写异步或基于回调的代码更容易。且代码量会有效减少，可读性的提高。本文通过挖掘精简RxJS源码，力求实现一个tiny版的RxJS，用简单的demo深入浅出理解RxJS的核心思想。

## 举个例子：

通过伪代码，实现一个业务中常见的滚动**下拉加载**：
##### 普通：

![image.webp](https://raw.githubusercontent.com/blazer233/algorithm-learn/main/rx-xstate/rx/2.png)

上述代码，我们可以看出来几点问题:

1. 两个异步行为（`fetch`请求事件、页面滚动事件），两个异步事件的处理显得很冗余，且不容易阅读。
2. 我们要使用 `flag` 去判断状态（`isRequesting` 判断上一个请求是否已经处理完成）。
3. 如果我们需要判断请求的次数，还需要更多的 `flag` 在外层来记录。

##### rxjs：

![image.webp](https://raw.githubusercontent.com/blazer233/algorithm-learn/main/rx-xstate/rx/1.png)

RxJS配合操作符（`operator`），提高了每一步操作的可读性，将事件转换成（`Observable`）通过流的方式进行监听并处理，并且在处理业务逻辑时，**可以将每一步拆成更小的函数，通过更多的`operator`连接，提高业务代码的复用性和可读性**，这也是`RxJS`的精髓所在。



接下来，我们首先来实现 RxJS 框架中核心的核心 —— **Observable**

---

## Observable：

在我们实现的tony版RxJS中，需要跑通下面的Demo。

```js
import { Observable } from 'rxjs';

// Create a lazy Push System
const observable = new Observable(observer => {
    observer.next(1);
    observer.next(2);
    observer.next(3);
    observer.complete();
    return () => console.log('succes');
});

// Subscribe the lazy Push System
observable.subscribe({
    next: (value) => console.log('we got', value),
    complete: () => console.log('completed'),
});

/**
 * Output:
 * we got 1
 * we got 2
 * we got 3
 * completed
 * 'succes'
 */

```

在`RxJS`中`Observable`是可以被订阅（subscribe）的一个流对象，而`observer`是订阅`Observable`的物件，理解这两者的区别和联系是很重要的。

在上述Demo中`observer`的方法有：

- observer.next()：类似于promise的then，表示接下来的传入或操作。
- observer.complete()：表示观察者对象的流结束，complete()触发后，next将不再起作用。

通常subscribe对象中仅传入一个函数的时候视为next函数执行。


在`RxJS`中，每一个函数都是一个 [lazy Pull](https://rxjs.dev/guide/observable) 系统，只有我们订阅 Observable，我们才可以拿到我们需要的数据，执行订阅的函数。

#### Observable

通过Demo，我们发现:

1. `Observable`是一个入参为函数的构造函数
2. `Observable`的入参函数会拿到`observer`作为参数
3. `Observable`原型链上存在`subscribe`函数，作为订阅的开关

那么可以拆解源码实现如下代码：

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
[点击查看对应源码](https://github.com/ReactiveX/rxjs/blob/master/src/internal/Observable.ts#L35)

在如上代码里 new 实例化`Observable`对象，其传入参数对内部方法`_subscribe`进行了覆盖，之后在调用`subscribe`时，将`observable.subscribe({...})`传入的对象转化为`Subscriber`的实例对象，之后调用实例对象的`add`方法，将一开始`new Observable`时传入的方法执行，如果执行后返回为函数，则挂载到实例对象上，销毁时执行。

此时就有小伙伴纳闷了，`SafeSubscriber`、`Subscriber`、`add方法`...这些都是啥？？？
![image.webp](https://raw.githubusercontent.com/blazer233/algorithm-learn/main/rx-xstate/rx/wen.png)

我们先往下看，订阅时调用subscibe方法，接受三个可选参数，如下图

```js
subscribe(
  observerOrNext?: Partial<Observer<T>> | ((value: T) => void) | null,
  error?: ((error: any) => void) | null,
  complete?: (() => void) | null
): Subscription {...}
```
[点击查看对应源码](https://github.com/ReactiveX/rxjs/blob/master/src/internal/Observable.ts#L214)

`error`和`complete`参数没有传，暂时无需关注，对于`observerOrNext`接口中定义了三种类型，分别是`Observer<T>`对象，函数`(value: T) => void`和空值`null`。


subscribe方法真正需要的是`Subscriber`的实例对象，所以一开始就会进行判断，是否为`Subscriber`的实例对象。如果不是就会通过`SafeSubscriber`将我们传入的对象（包含 next、error 和 complete 函数）重新进行处理，使得其拥有添加订阅，取消订阅的功能（add、unsubscribe），接着我们看下`SafeSubscriber`如何实现。


#### SafeSubscriber

`SafeSubscriber`继承于 `Subscriber`，而`Subscriber`方法也是对入参`observerOrNext`进行了又一层封装，本质还是继承了`Subscription`方法，add、unsubscribe等核心方法最终是挂载在`Subscription`上（后面会提到）。

```js
export class SafeSubscriber extends Subscriber {
  constructor(observerOrNext, error, complete) {
    super();
    this.destination = new Observer(observerOrNext, error, complete, this);
  }
}
```
[点击查看对应源码](https://github.com/ReactiveX/rxjs/blob/master/src/internal/Subscriber.ts#L193)


#### Observer

Observer 中对传入的`observerOrNext`上 `next`、`error`、`complete` 三个方法做了一层兼容封装，保证即使没有如上三个方法，也会构成出兜底的方法。

```js
export function defaultErrorHandler(err) {
  throw err;
}
export function noop() {
  return function () {};
}

export class Observer {
  static isObserver(obj) {
    return (
      typeof obj.next == "function" ||
      typeof obj.error == "function" ||
      typeof obj.error == "function"
    );
  }
  constructor(observerOrNext, error, complete, context) {
    if (Observer.isObserver(observerOrNext)) {
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

Subscriber上的`this.destination`，在`new SafeSubscriber`的时候，被设置了 `next`、`error`、`complete`三个方法属性（即Observer的实例对象）。


```js
class Subscriber extends Subscription {
  isStopped = false;
  destination = null;
  constructor(destination) {
    super();
    this.destination = destination;
    if (destination instanceof Subscription) {
      destination.add(this);
    }
  }
  next(value) {
    if (!this.isStopped) {
     this.destination.next(value);
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
[点击查看对应源码](https://github.com/ReactiveX/rxjs/blob/master/src/internal/Subscriber.ts#L21)


通过`isStopped`和`closed`两个flag对执行顺序进行了限制。

- 确保`complete`不会重复执行
- 确保`complete`执行后不会再执行`next`函数
- 确保`unsubscribe`不会重复执行

接下来，我们继续看`Subscription`函数。

#### Subscription

现在就是真正的核心，即`RxJS`是如何实现 订阅/卸载 （add/unsubscribe）这一功能的。

```js
export class Subscription {
  constructor() {
    this.closed = false; // 是否已经取消订阅
    this._disposeFuncs = []; // 回收函数列表
  }
  /**
   * 取消订阅，释放资源
   */
  unsubscribe() {
    if (!this.closed) {
      this.closed = true;
      this._disposeFuncs.forEach(i => {
        if (typeof i == "function") {
          i();
        } else if (i && typeof i.unsubscribe == "function") {
          i.unsubscribe();
        }
      });
    }
  }

  /**
   * 添加取消订阅处理
   * @param {*} dispose
   */
  add(dispose) {
    if (this.closed) {
      if (typeof dispose == "function") {
        dispose();
      } else if (dispose && typeof dispose.unsubscribe == "function") {
        dispose.unsubscribe();
      }
    } else {
      this._disposeFuncs.push(dispose);
    }
  }
}
```
[点击查看对应源码](https://github.com/ReactiveX/rxjs/blob/master/src/internal/Subscription.ts#L18)

上面代码首先通过closed标记是否取消订阅，并提供两个方法。

- add：如果已经取消订阅，则立刻执行收集到的函数，此时如果收集到的函数是继承于`Subscription`的实例对象，则进行卸载，如果还没取消订阅，就把函数进行收集，订阅结束时循环执行。

- unsubscribe：取消订阅状态，将`add`收集到的函数循环执行。

*此处有点类似于 React.useEffect 最后返回的那个方法。

*源码中可以通过add方法链接其他的subscription，此处还有涉及到父子级的概念，在父subscription调用 unsubscribe方法取消订阅的时候，会调用子 subscription 的 unsubscribe，取消其下所有子孙 subscription 的订阅，此处代码没有提现，有兴趣可以点击源码查看。

以上就是我们代码的全部实现，全部代码抽出来应该在100行左右。有兴趣的可以将以上代码进行拷贝出来应该可以跑通一开始的Demo。

## 总结

以上就是一个简单`Observable`的tiny版实现，其实很多也还没有讲，比如
* pipe是什么？
* 操作符是如何链接的？
* Subject是如何实现的？
* ...

接下来我会分篇章一一实现。

手写一遍之后，可能会有一种感觉 "这不就是个观察者模式吗"，如果仅仅想实现功能，也会有更简版的实现，十几行就能完成。

但是当我们深入源码，拆分代码，剥去外壳，去最终一步一步实现功能找到答案，而这个过程才是我们应当所追求的

毕竟 ***Programming Is Thinking Not Typing***。

![image.webp](https://raw.githubusercontent.com/blazer233/algorithm-learn/main/rx-xstate/rx/fo.png)

---
参考：
  https://www.youtube.com/watch?v=BA1vSZwzkK8
  https://github.com/ReactiveX/rxjs/blob/master/src/internal/Observable.ts
  https://segmentfault.com/a/1190000041506612
  https://juejin.cn/post/6991021120031817765/#heading-5
  https://juejin.cn/post/7036266380030640164

以上就是 npm 包 [rxjs](https://github.com/ReactiveX/rxjs) 第一部分`Observable`的源码学习。
