import axios, { AxiosRequestConfig } from "axios";
import { Trace } from "@/tool/Tool";

export class BaseApi {
  async request<T = any>(
    path: string,
    method: "get" | "post" | "put" | "delete",
    data: never,
    config: any = {
      headers: {},
    }
  ): Promise<T> {
    return await new Promise((resolve, reject) => {
      const requestUrl = path;
      const req = {
        url: requestUrl,
        method,
        params: undefined,
        data: undefined,
        headers: {},
      };
      if (["get", "delete"].indexOf(method.toLowerCase()) > -1) {
        req.params = data;
      } else {
        req.data = data;
      }
      if (config.headers) {
        req.headers = config.headers;
      }

      axios(req as AxiosRequestConfig)
        .then((res) => {
          Trace.print(
            `request success ${method} ${requestUrl} data =`,
            data,
            `result = `,
            res.data
          );
          resolve(res.data as T);
        })
        .catch((err) => {
          Trace.print(
            `request error ${method} ${requestUrl} data =`,
            data,
            `error = `,
            err
          );
          const msg = "Network Error";
          reject(msg);
        });
    });
  }
}

export const apis = new BaseApi();
