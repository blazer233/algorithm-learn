import { Observable } from "../core/Observable";
import { Subject } from "../core/Subject";

export function bindCallback(callbackFunc) {
  return function (obj, ...args) {
    const subject = new Subject();
    let uninitialized = true;
    return new Observable(subscriber => {
      const subs = subject.subscribe(subscriber);
      if (uninitialized) {
        uninitialized = false;
        let isAsync = false;
        let isComplete = false;
        callbackFunc.apply(obj, [
          ...args,
          (...results) => {
            subject.next(1 < results.length ? results : results[0]);
            isComplete = true;
            if (isAsync) {
              subject.complete();
            }
          },
        ]);
        if (isComplete) {
          subject.complete();
        }
        isAsync = true;
      }
      return subs;
    });
  };
}
