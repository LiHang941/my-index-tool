import { BaseApi } from "@/api/index";
import { isNullOrBlank } from "@/tool/Tool";
import { KLineData } from "klinecharts";

export class BinanceApi {
  baseApi: BaseApi;

  constructor(baseApi: BaseApi) {
    this.baseApi = baseApi;
  }

  async getKline(
    symbol: string,
    interval: string,
    startTime: string,
    endTime: string
  ): Promise<KLineData[]> {
    const data: any = {
      symbol: symbol,
      interval: interval,
    };

    if (!isNullOrBlank(startTime)) {
      data["startTime"] = startTime;
    }
    if (!isNullOrBlank(endTime)) {
      data["endTime"] = endTime;
    }
    const execute = await this.baseApi.request(
      "https://api.binance.com/api/v3/klines",
      "get",
      data,
      {}
    );
    return execute.map((item: any) => {
      return {
        timestamp: parseInt(item[0], 10),
        open: parseFloat(item[1]),
        high: parseFloat(item[2]),
        low: parseFloat(item[3]),
        close: parseFloat(item[4]),
        volume: parseFloat(item[5]),
      };
    });
  }

  /**
   * 获取所有的K
   *
   * @param symbol 交易对
   * @param interval 周期 1m 3m 5m 15m 30m 1h 2h 4h 6h 8h 12h 1d 3d 1w 1M
   * @return
   * @throws IOException
   */
  async getAllKline(symbol: string, interval: string): Promise<KLineData[]> {
    const startTime = "";
    let endTime = "";
    const result = [];
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const kline = await this.getKline(symbol, interval, startTime, endTime);
      if (kline.length == 0) {
        break;
      }
      endTime = Number(kline[0].timestamp - 1).toString();
      kline.reverse();
      result.push(...kline);
      if (result.length > 2000) {
        break;
      }
    }
    result.reverse();
    return result;
  }
}
