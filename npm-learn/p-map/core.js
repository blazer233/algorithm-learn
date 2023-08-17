class PInstance {
  get promise() {
    return Promise.all(this.items);
  }
  constructor(items = []) {
    this.items = Array.from(items);
  }
  map(fn) {
    return new PInstance(
      this.items.map(async (i, idx) => {
        const v = await i;
        return fn(v, idx);
      })
    );
  }
  then(fn) {
    const p = this.promise;
    return fn ? p.then(fn) : p;
  }
  catch(fn) {
    return this.promise.catch(fn);
  }

  finally(fn) {
    return this.promise.finally(fn);
  }
}
module.exports = arr => new PInstance(arr);
