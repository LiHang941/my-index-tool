import BigNumber from "bignumber.js";
import { BasicException } from "./BasicException";

/**
 * 轮询休眠时长 ms
 */
export const SLEEP_MS = 1000;

/**
 *  b / 1e18
 * @param bnAmount
 * @param precision
 */
export const convertBigNumber = (
  bnAmount: string | number,
  precision = 1e18
) => {
  return new BigNumber(bnAmount).dividedBy(new BigNumber(precision)).toFixed();
};

/**
 * b * 1e18
 * @param bnAmount
 * @param precision
 */
export const convertAmount = (bnAmount: string | number, precision = 1e18) => {
  return new BigNumber(bnAmount)
    .multipliedBy(new BigNumber(precision))
    .toFixed();
};

/**
 * amount * (10 ** decimals)
 * @param amount
 * @param decimals
 */
export const toTokenAmount = (amount: string | number, decimals = 18) => {
  return new BigNumber(amount)
    .multipliedBy(new BigNumber("10").pow(decimals))
    .toFixed();
};

/**
 * 休眠指定时间
 * @param ms
 */
export const sleep = async (ms: number) => {
  return await new Promise((resolve) =>
    setTimeout(() => {
      resolve(1);
    }, ms)
  );
};

/**
 * 判断算法未空字符串
 * @param value
 */
export const isNullOrBlank = (value: string) => {
  return !value || false || value === "" || value.length === 0;
};

/**
 * 重试
 * @param func
 * @param retryCount
 */
export const retry = async (func: () => any, retryCount = 3) => {
  let count = retryCount;
  do {
    try {
      return await func();
    } catch (e: any) {
      if (count > 0) {
        count--;
      }
      if (count <= 0) {
        throw new BasicException(e.toString(), e);
      }
      console.error("retry", e);
      await sleep(SLEEP_MS);
    }
    // eslint-disable-next-line no-constant-condition
  } while (true);
};

/**
 * 日志工具
 */
export class TraceTool {
  private logShow = true;
  private errorShow = true;

  public setLogShow(b: boolean) {
    this.logShow = b;
  }

  public setErrorShow(b: boolean) {
    this.errorShow = b;
  }

  public print(...args: any[]) {
    if (this.logShow) {
      console.log(args.length === 1 ? args[0] : args);
    }
  }

  public error(...args: any[]) {
    if (this.errorShow) {
      console.error(args);
    }
  }
}

export const Trace = new TraceTool();
