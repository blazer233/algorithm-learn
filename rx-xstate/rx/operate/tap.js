import { operate, OperatorSubscriber } from "./OperatorSubscriber";

export function tap(observerOrNext) {
  return operate((source, subscriber) => {
    source.subscribe(new OperatorSubscriber(subscriber, observerOrNext));
  });
}
