# 【硬核拆解】从源码实现一个rxjs（Operators篇）

![image.webp](https://raw.githubusercontent.com/blazer233/algorithm-learn/main/rx-xstate/rx/title.webp)

> 项目代码：https://github.com/blazer233/algorithm-learn/tree/main/rx-xstate/rx
>
>
> 参考轮子：https://github.com/ReactiveX/rxjs


上一篇文章我们从源码的角度重新认识了 `Observable` ，本质是通过 `subscribe` 的 `add` 方法对函数进行收集和订阅，并且用`Subscriber`、`Observer`等构造函数使得观察者模式更加健壮。

今天我们继续来研究 `RXJS` 中的 `Operators`，通过阅读源码实现实现几个典型的操作符如:

- 创建型Operators : `from` 、`fromEvent`
- 转换型Operators : `take` 、`map`

---

## Operators：

在我们实现的 `tony` 版 `RxJS` 中，需要跑通下面的Demo。

Demo1
```js
import { from, take, map, fromEvent } from 'rxjs';
from("2345").subscribe(console.log);

/**
 * Output:
 * 2
 * 3
 * 4
 * 5
 */
```

Demo2
```js
import { from, take, map, fromEvent } from 'rxjs';
fromEvent(document, "click")
  .pipe(
    take(4),
    map(({ target }) => {})
  )
  .subscribe(console.log);

/**
 * Output:
 * {type: 'click'}
 * {type: 'click'}
 * {type: 'click'}
 * {type: 'click'}
 */

```

#### from

`from` 能够从 `Array`、`array-like`... 这几类对象上创造出 `Observable`（即将这几类对象作为数据源），这几类对象几乎可以囊括所有的 `js` 对象了，所以 `rxjs` 给 `from` 的注释是：`Converts almost anything to an Observable`


如上面Demo1，通过`from`将字符串转换为 `Observable`，并且通过`subscribe`订阅的console.log函数将其依次打印，那么可以拆解源码实现如下代码：

* from对不同的对象有不同的处理方法，此处只讨论 `array-like` 类型

```js
import { Observable } from "./core";

export function from(obj) {
  return new Observable(subscriber => {
    for (let i = 0; i < obj.length && !subscriber.closed; i++) {
      subscriber.next(obj[i]);
    }
    subscriber.complete();
  });
}


```
[点击查看对应源码](https://github.com/ReactiveX/rxjs/blob/afac3d574323333572987e043adcd0f8d4cff546/src/internal/observable/innerFrom.ts#L77)

在如上代码中返回了一个 `Observable` 的实例对象，将传入的 `array-like` 在没有主动设置`closed` 的情况下依次调用 `next` 将每个值进行收集，遍历结束调用 `complete` 方法进行发布


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

-  https://www.youtube.com/watch?v=BA1vSZwzkK8
-  https://github.com/ReactiveX/rxjs/blob/master/src/internal/Observable.ts
-  https://segmentfault.com/a/1190000041506612
-  https://juejin.cn/post/6991021120031817765/#heading-5
-  https://juejin.cn/post/7036266380030640164

以上就是 npm 包 [rxjs](https://github.com/ReactiveX/rxjs) 第一部分`Observable`的源码学习。
