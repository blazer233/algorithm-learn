import { Subscriber, SafeSubscriber } from "./Subscriber";
export class Observable {
  source = null;
  operator = null;

  static create(subscribe) {
    return new Observable(subscribe);
  }
  static isObservable(obj) {
    return obj instanceof Observable;
  }

  constructor(subscribe) {
    if (subscribe) this._subscribe = subscribe;
  }

  lift(operator) {
    const observable = new Observable();
    observable.source = this;
    observable.operator = operator;
    return observable;
  }

  subscribe(observerOrNext, error, complete) {
    const subscriber = Subscriber.isSubscriber(observerOrNext)
      ? observerOrNext
      : new SafeSubscriber(observerOrNext, error, complete);
    if (this.operator) {
      subscriber.add(this.operator.call(subscriber, this.source));
    } else {
      subscriber.add(this._subscribe(subscriber));
    }
    return subscriber;
  }

  use(observerOrNext, error, complete) {
    return this.subscribe(observerOrNext, error, complete);
  }
  pipe(...operations) {
    // debugger
    return operations.reduce((prev, fn) => fn(prev), this);
  }
}

export const EMPTY = new Observable(subscriber => subscriber.complete());
