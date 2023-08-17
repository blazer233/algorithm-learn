const processFunction = (function_, options, proxy, unwrapped) =>
  function (...arguments_) {
    return new Promise((resolve, reject) => {
      if (options.multiArgs) {
        arguments_.push((...result) => {
          if (options.errorFirst) {
            if (result[0]) {
              reject(result);
            } else {
              result.shift();
              resolve(result);
            }
          } else {
            resolve(result);
          }
        });
      } else if (options.errorFirst) {
        arguments_.push((error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      } else {
        arguments_.push(resolve);
      }

      const self = this === proxy ? unwrapped : this;
      Reflect.apply(function_, self, arguments_);
    });
  };

const filterCache = new WeakMap();

module.exports = (input, options) => {
  options = {
    exclude: [/.+(?:Sync|Stream)$/],
    errorFirst: true,
    ...options,
  };

  const filter = (target, key) => {
    let cached = filterCache.get(target);
    if (!cached) {
      cached = {};
      filterCache.set(target, cached);
    }

    if (key in cached) {
      return cached[key];
    }

    const match = pattern =>
      typeof pattern === "string" || typeof key === "symbol"
        ? key === pattern
        : pattern.test(key);
    const descriptor = Reflect.getOwnPropertyDescriptor(target, key);
    const writableOrConfigurableOwn =
      descriptor === undefined ||
      descriptor.writable ||
      descriptor.configurable;
    const included = options.include
      ? options.include.some(element => match(element))
      : !options.exclude.some(element => match(element));
    const shouldFilter = included && writableOrConfigurableOwn;
    cached[key] = shouldFilter;
    return shouldFilter;
  };

  const cache = new WeakMap();

  const proxy = new Proxy(input, {
    apply(target, self, args) {
      console.log(target, self, args);
      const cached = cache.get(target);

      if (cached) {
        return Reflect.apply(cached, self, args);
      }

      const pified = processFunction(target, options, proxy, target);
      cache.set(target, pified);
      return Reflect.apply(pified, self, args);
    },

    get(target, key) {
      const property = target[key];

      // eslint-disable-next-line no-use-extend-native/no-use-extend-native
      if (!filter(target, key) || property === Function.prototype[key]) {
        return property;
      }

      const cached = cache.get(property);

      if (cached) {
        return cached;
      }

      if (typeof property === "function") {
        const pified = processFunction(property, options, proxy, target);
        cache.set(property, pified);
        return pified;
      }

      return property;
    },
  });

  return proxy;
};
