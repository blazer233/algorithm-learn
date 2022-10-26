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

  static isSubscription(obj) {
    let res = false;
    if (typeof obj == "object") {
      if (obj instanceof Subscription) {
        res = true;
      } else if (
        "closed" in obj &&
        typeof obj.add == "function" &&
        typeof obj.remove == "function" &&
        typeof obj.unsubscribe == "function"
      ) {
        res = true;
      }
    }
    return res;
  }

  // 是否已经取消订阅
  closed = false;
  // 父节点
  _parents = [];
  // 回收函数列表
  _disposeFuncs = [];

  constructor(initDispose) {
    this.initDispose = initDispose;
  }

  /**
   * 取消订阅，释放资源
   */
  unsubscribe() {
    if (!this.closed) {
      this.closed = true;
      this._parents.forEach(i => i.remove(this));
      if (typeof this.initDispose == "function") {
        this.initDispose();
      }
      this._disposeFuncs.forEach(i => execDispose(i));
    }
  }
  dispose() {
    this.unsubscribe();
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
        if (dispose instanceof Subscription) {
          if (dispose.closed || dispose._isParent(this)) return;
          dispose._addParent(this);
        }
        this._disposeFuncs.push(dispose);
      }
    }
  }

  /**
   * 添加父节点
   * @param {Subscription} parent 父节点
   */
  _addParent(parent) {
    this._parents.push(parent);
  }

  /**
   * 判断是否父节点
   * @param {Subscription} parent 父节点
   * @returns {boolean}
   */
  _isParent(parent) {
    return this._parents.includes(parent);
  }

  /**
   * 删除父节点
   * @param {Subscription} parent 父节点
   * @returns
   */
  _removeParent(parent) {
    const idx = this._parents.indexOf(parent);
    if (idx >= 0) {
      this._parents.splice(idx, 1);
    }
  }

  /**
   * 移除取消订阅处理
   * @param {*} dispose
   */
  remove(dispose) {
    const idx = this._disposeFuncs.indexOf(dispose);
    if (idx >= 0) {
      this._disposeFuncs.splice(idx, 1);
    }
    if (dispose instanceof Subscription) {
      dispose._removeParent(this);
    }
  }
}

export const EMPTY_SUBSCRIPTION = Subscription.EMPTY;
