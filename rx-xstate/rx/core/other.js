class Subscription {
  constructor() {
    this.closed = false; // 是否已经取消订阅
    this._disposeFuncs = []; // 回收函数列表
  }
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
class Subscriber extends Subscription {
  isStopped = false;
  destination = null;
  constructor(destination) {
    super();
    this.destination = destination;
    if (destination instanceof Subscription) destination.add(this);
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
class SafeSubscriber extends Subscriber {
  constructor(observerOrNext, error, complete) {
    super();
    this.destination = new Observer(observerOrNext, error, complete, this);
  }
}
export function defaultErrorHandler(err) {
  throw err;
}
export function noop() {
  return function () {};
}
export class Observer {
  static isObserver(obj) {
    return (
      typeof obj == "object" ||
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
export class Observable {
  constructor(subscribe) {
    if (subscribe) this._subscribe = subscribe;
  }
  subscribe(observerOrNext) {
    const subscriber =
      observerOrNext instanceof Subscriber
        ? observerOrNext
        : new SafeSubscriber(observerOrNext);
    subscriber.add(this._subscribe(subscriber));
    return subscriber;
  }
}
