/**
 * 增加 静态属性 方便对对象进行缓存
 * @param key
 * @constructor
 */
export function CacheKey(key: string) {
  // tslint:disable-next-line:only-arrow-functions
  return function (target: any) {
    target.CACHE_KEY = key;
  };
}

/**
 * 对方法进行标记
 * @param key
 * @constructor
 */
export function EnableProxy() {
  // tslint:disable-next-line:only-arrow-functions
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    target[propertyKey].proxyEnable = true;
  };
}

/**
 * 对方法进行标记,打印LOG
 * @param key
 * @constructor
 */
export function EnableLogs() {
  // tslint:disable-next-line:only-arrow-functions
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    target[propertyKey].logEnable = true;
  };
}
