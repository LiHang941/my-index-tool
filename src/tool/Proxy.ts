import { Trace } from "./Tool";
import { BasicException } from "./BasicException";

export class ErrorInfo {
  error: Error;
  msg: string;
  method: string;
  args: any;
  target: any;
}

let availableErrorHandler: (error: ErrorInfo) => void = (error: ErrorInfo) => {
  Trace.error("availableErrorHandler", error);
};

/**
 * 注册 交易异常处理回调
 * @param errorHandler
 */
export function registerTransactionErrorHandler(
  errorHandler: (error: ErrorInfo) => void
) {
  availableErrorHandler = errorHandler;
}

/**
 * 异常处理控制器
 * @param e
 * @param method
 * @param args
 * @param target
 */
export function errorHandlerController(
  e: Error,
  method: string,
  args: any,
  target: any
) {
  try {
    const errorInfo = new ErrorInfo();
    errorInfo.error = e;
    errorInfo.method = method;
    try {
      errorInfo.args = JSON.stringify(args);
    } catch (e) {
      errorInfo.args = args;
    }
    errorInfo.target = target;

    if (e instanceof BasicException) {
      errorInfo.msg = e.msg;
    } else {
      errorInfo.msg = e.toString();
    }
    availableErrorHandler(errorInfo);
  } catch (e) {
    Trace.error(e);
  }
}

/**
 * 对象代理
 * @param obj
 */
export function createProxy<T extends object>(obj: T): T {
  return new Proxy(obj, {
    get(target: any, propKey: string) {
      const ins = target[propKey];
      // const typeStr = Object.prototype.toString.call(target[propKey]);
      // if (typeStr === '[object AsyncFunction]' || typeStr === '[object Function]')
      // 使用注解设置数据
      if (ins.proxyEnable || ins.logEnable) {
        // tslint:disable-next-line:only-arrow-functions
        return function () {
          // eslint-disable-next-line prefer-rest-params
          const args = arguments;
          // 不能使用箭头函数，获取到的 arguments 不是请求的

          const successCallBack = (data: any) => {
            if (ins.logEnable) {
              Trace.print(
                `${(target.constructor as any).CACHE_KEY}.${propKey} `,
                "args=",
                args,
                "result",
                data
              );
            }
          };
          const errorCallBack = (err: any) => {
            if (ins.proxyEnable) {
              errorHandlerController(err, propKey, args, target);
            }

            if (ins.logEnable) {
              errorHandlerController(err, propKey, args, target);
              Trace.print(
                `${(target.constructor as any).CACHE_KEY}.${propKey}`,
                "args=",
                args,
                "error",
                err
              );
            }
          };

          try {
            const res = ins.apply(target, args);

            if (res instanceof Promise) {
              return new Promise((resolve, reject) => {
                res
                  .then((data) => {
                    successCallBack(data);

                    resolve(data);
                  })
                  .catch((err) => {
                    errorCallBack(err);
                    reject(err);
                  });
              });
            } else {
              successCallBack(res);
              return res;
            }
          } catch (err: any) {
            errorCallBack(err);
            throw err;
          }
        };
      } else {
        // 非方法对象，直接返回
        return ins;
      }
    },
  });
}
