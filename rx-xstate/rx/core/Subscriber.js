import { Observer } from "./Observer";
import { Subscription } from "./Subscription";
import { EMPTY_OBSERVER } from "./util";

export class Subscriber extends Subscription {
  isStopped = false;
  destination = null;

  static create(observerOrNext, error, complete) {
    return new SafeSubscriber(observerOrNext, error, complete);
  }
  static isSubscriber(value) {
    return (
      (value && value instanceof Subscriber) ||
      (Observer.isObserver(value) && value instanceof Subscription)
    );
  }

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

  next(value, id) {
    if (!this.isStopped) {
      this._next(value, id);
    }
  }

  error(err) {
    if (!this.isStopped) {
      this.isStopped = true;
      this._error(err);
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

  _next(value, id) {
    this.destination.next(value, id);
  }

  _error(err) {
    try {
      this.destination.error(err);
    } finally {
      this.unsubscribe();
    }
  }

  _complete() {
    try {
      this.destination.complete();
    } finally {
      this.unsubscribe();
    }
  }
}

export class SafeSubscriber extends Subscriber {
  constructor(observerOrNext, error, complete) {
    super();
    this.destination = new Observer(observerOrNext, error, complete, this);
  }
}
