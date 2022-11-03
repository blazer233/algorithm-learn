/**
 * 执行资源释放
 * @param {*} dispose 函数或者Subscription对象
 */
function execDispose(dispose) {
  if (typeof dispose == "function") {
    dispose();
  } else if (dispose && typeof dispose.unsubscribe == "function") {
    dispose.unsubscribe();
  }
}

export class Subscription {
  static EMPTY = (() => {
    const empty = new Subscription();
    empty.closed = true;
    return empty;
  })();

  constructor(initDispose) {
    this.initDispose = initDispose;
    this.closed = false; // 是否已经取消订阅
    this._disposeFuncs = []; // 回收函数列表
  }

  /**
   * 取消订阅，释放资源
   */
  unsubscribe() {
    if (!this.closed) {
      if (typeof this.initDispose == "function") {
        this.initDispose();
      }
      this.closed = true;
      this._disposeFuncs.forEach(i => execDispose(i));
    }
  }

  /**
   * 添加取消订阅处理
   * @param {*} dispose
   */
  add(dispose) {
    if (dispose && dispose !== this) {
      if (this.closed) {
        execDispose(dispose);
      } else {
        this._disposeFuncs.push(dispose);
      }
    }
  }
}

export const EMPTY_SUBSCRIPTION = Subscription.EMPTY;
