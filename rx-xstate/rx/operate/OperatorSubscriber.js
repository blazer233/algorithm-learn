import { Subscriber } from "../core/Subscriber";

export function operate(init) {
  return source => {
    if (source && typeof source.lift == "function") {
      return source.lift(function (liftedSource) {
        try {
          return init(liftedSource, this);
        } catch (err) {
          this.error(err);
        }
      });
    }
    throw new TypeError("不能提升(lift)非Observable类型");
  };
}
export class OperatorSubscriber extends Subscriber {
  constructor(destination, onNext, onComplete, onFinalize) {
    super(destination);
    this.type = "operator";
    this.onFinalize = onFinalize;
    if (onNext) {
      this._next = function (value, id) {
        onNext(value, id);
      };
    } else {
      this._next = super._next;
    }

    if (onComplete) {
      this._complete = function () {
        try {
          onComplete();
        } finally {
          this.unsubscribe();
        }
      };
    }
  }

  unsubscribe() {
    const { closed } = this;
    super.unsubscribe();
    !closed && this.onFinalize?.();
    if (!closed && typeof this.onFinalize == "function") {
      this.onFinalize();
    }
  }
}
