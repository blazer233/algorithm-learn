class Subscription {
  constructor(initDispose) {
    this.initDispose = initDispose;
    this.closed = false; // 是否已经取消订阅
    this._disposeFuncs = []; // 回收函数列表
  }
  static execDispose(dispose) {
    if (typeof dispose == "function") {
      dispose();
    } else if (dispose && typeof dispose.unsubscribe == "function") {
      dispose.unsubscribe();
    }
  }
  unsubscribe() {
    if (!this.closed) {
      if (typeof this.initDispose == "function") {
        this.initDispose();
      }
      this.closed = true;
      this._disposeFuncs.forEach(i => Subscription.execDispose(i));
    }
  }
  add(dispose) {
    if (dispose && dispose !== this) {
      if (this.closed) {
        Subscription.execDispose(dispose);
      } else {
        this._disposeFuncs.push(dispose);
      }
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
      this._next(value);
    }
  }
  complete() {
    if (!this.isStopped) {
      this.isStopped = true;
      this._complete();
    }
  }
  unsubscribe() {
    if (!this.closed) {
      this.isStopped = true;
      super.unsubscribe();
      this.destination = null;
    }
  }
  _next(value) {
    this.destination.next(value);
  }
  _complete() {
    try {
      this.destination.complete();
    } finally {
      this.unsubscribe();
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
  source = null;
  operator = null;
  constructor(subscribe) {
    if (subscribe) this._subscribe = subscribe;
  }
  subscribe(observerOrNext) {
    const subscriber =
      observerOrNext instanceof Subscriber
        ? observerOrNext
        : new SafeSubscriber(observerOrNext);
    if (this.operator) {
      subscriber.add(this.operator.call(subscriber, this.source));
    } else {
      subscriber.add(this._subscribe(subscriber));
    }
    return subscriber;
  }
  lift(operator) {
    const observable = new Observable();
    observable.source = this;
    observable.operator = operator;
    return observable;
  }
  pipe(...operations) {
    const pipeFromArray = funcs => {
      const len = funcs.length;
      if (len == 0) return identity;
      if (len == 1) return funcs[0];
      return input => funcs.reduce((prev, fn) => fn(prev), input);
    };
    const pipeFunc = pipeFromArray(operations);
    return operations.length ? pipeFunc(this) : this;
  }
}

export function from(obj) {
  if (obj instanceof Observable) return obj;
  if (obj) {
    if (typeof obj.length === "number" && typeof obj != "function") {
      return new Observable(subscriber => {
        for (let i = 0; i < obj.length && !subscriber.closed; i++) {
          subscriber.next(obj[i]);
        }
        subscriber.complete();
      });
    }
  }
}
export function operate(init) {
  return source => {
    if (source && typeof source.lift == "function") {
      return source.lift(function (liftedSource) {
        return init(liftedSource, this);
      });
    }
  };
}
export class OperatorSubscriber extends Subscriber {
  constructor(destination, onNext, onComplete, onFinalize) {
    super(destination);
    this.type = "operator";
    this.onFinalize = onFinalize;
    this._next = onNext || super._next;
    this._complete = onComplete || super._complete;
  }
  unsubscribe() {
    super.unsubscribe();
    !this.closed && this.onFinalize?.();
  }
}

export function map(func, thisArg) {
  return operate((source, subscriber) => {
    let index = 0;
    source.subscribe(
      new OperatorSubscriber(subscriber, value => {
        subscriber.next(func.call(thisArg, value, index));
        index += 1;
      })
    );
  });
}
export function take(count) {
  if (count <= 0) {
    return () => new Observable(s => s.complete());
  }
  return operate((source, subscriber) => {
    let seen = 0;
    source.subscribe(
      new OperatorSubscriber(subscriber, value => {
        if (seen < count) {
          subscriber.next(value);
          seen += 1;
        } else {
          subscriber.complete();
        }
      })
    );
  });
}
