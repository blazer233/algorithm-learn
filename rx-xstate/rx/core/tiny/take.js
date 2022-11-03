import { operate, Observable, OperatorSubscriber } from "./core";
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
