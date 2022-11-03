import { operate, OperatorSubscriber } from "./core";

export function map(func) {
  return operate((source, subscriber) => {
    let index = 0;
    source.subscribe(
      new OperatorSubscriber(subscriber, value => {
        subscriber.next(func(value, index, index++));
      })
    );
  });
}
