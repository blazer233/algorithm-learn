import { noop, defaultErrorHandler } from "./util";
/**
 * 观察者对象
 */
export class Observer {
  static isObserver(obj) {
    let res = false;
    if (typeof obj == "object") {
      if (obj instanceof Observer) {
        res = true;
      } else if (
        typeof obj.next == "function" ||
        typeof obj.error == "function" ||
        typeof obj.complete == "function"
      ) {
        res = true;
      }
    }
    return res;
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
