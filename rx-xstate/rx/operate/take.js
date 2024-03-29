import { EMPTY } from "../core/Observable";
import { OperatorSubscriber, operate } from "./OperatorSubscriber";

export function take(count) {
  if (count <= 0) return () => EMPTY;
  return operate((source, subscriber) => {
    let seen = 0;
    source.subscribe(
      new OperatorSubscriber(subscriber, value => {
        seen += 1;
        if (seen <= count) {
          subscriber.next(value);
          if (count <= seen) {
            subscriber.complete();
          }
        }
      })
    );
  });
}
