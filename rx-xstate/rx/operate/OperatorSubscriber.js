import { Subscriber } from "../core/Subscriber";

export function operate(init) {
  return source => {
    if (source && typeof source.lift == "function") {
      return source.lift(function (liftedSource) {
        return init(liftedSource, this);
      });
    }
  };
}
export class OperatorSubscriber extends Subscriber {
  constructor(destination, onNext, onComplete, onFinalize) {
    super(destination);
    this.type = "operator";
    this.onFinalize = onFinalize;
    if (onNext) {
      this._next = onNext;
    } else {
      this._next = super._next;
    }
    if (onComplete) {
      this._complete = onComplete;
    }
  }
  unsubscribe() {
    const { closed } = this;
    super.unsubscribe();
    !closed && this.onFinalize?.();
  }
}
