import { from } from "../observable/from";
import { OperatorSubscriber, operate } from "./OperatorSubscriber";

export function switchMap(project, resultSelector) {
  return operate((source, subscriber) => {
    let innerSubscriber = null;
    let index = 0;
    let isComplete = false;

    const checkComplete = () =>
      isComplete && !innerSubscriber && subscriber.complete();

    source.subscribe(
      new OperatorSubscriber(
        subscriber,
        value => {
          let innerIndex = 0;
          const outerIndex = index;
          innerSubscriber && innerSubscriber.unsubscribe();
          index += 1;
          from(project(value, outerIndex)).subscribe(
            (innerSubscriber = new OperatorSubscriber(
              subscriber,
              innerValue => {
                subscriber.next(
                  resultSelector
                    ? resultSelector(value, innerValue, outerIndex, innerIndex)
                    : innerValue
                );
                innerIndex += 1;
              },
              () => {
                innerSubscriber = null;
                checkComplete();
              }
            ))
          );
        },
        () => {
          isComplete = true;
          checkComplete();
        }
      )
    );
  });
}
