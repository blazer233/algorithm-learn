import { Observable } from "../core/Observable";
import { isArrayLike, isPromise } from "./util";

export function from(obj) {
  if (Observable.isObservable(obj)) return obj;
  if (obj) {
    if (isArrayLike(obj)) {
      return fromArrayLike(obj);
    }
    if (isPromise(obj)) {
      return fromPromise(obj);
    }
  }
  return new TypeError("输入类型错误;支持的类型[Observable,Promise,Array]");
}

export function fromArrayLike(obj) {
  return new Observable(subscriber => {
    for (let i = 0; i < obj.length && !subscriber.closed; i++) {
      subscriber.next(obj[i]);
    }
    subscriber.complete();
  });
}

export function fromPromise(obj) {
  return new Observable(subscriber => {
    obj.then(
      value => {
        if (!subscriber.closed) {
          subscriber.next(value);
          subscriber.complete();
        }
      },
      err => {
        subscriber.error(err);
      }
    );
  });
}
