import Axios, { AxiosError, AxiosRequestConfig } from "axios";
import {
  StockSkus,
  SellerType,
  Skus,
  ClientType,
  Stock,
  PimPayload,
  HttpHeaders,
  Logger,
} from "../types";

export default class HttpRepository {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  public async pimCheckVariants(
    jwt: string,
    sellerType: SellerType,
    data: PimPayload
  ): Promise<Skus> {
    try {
      const path = process.env.PIM_CHECK_VARIANTS_PATH as string;
      const response = await this.getClient("PIM", jwt, sellerType).post(
        path,
        data
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError, "checkVariants");
    }
  }

  public async stockHandle(
    jwt: string,
    sellerType: SellerType,
    data: StockSkus
  ): Promise<Stock> {
    try {
      const path = process.env.STOCK_HANDLE_PATH as string;
      const response = await this.getClient("STOCK", jwt, sellerType).post(
        path,
        data
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError, "handleStock");
    }
  }

  private getClient(
    clientType: ClientType,
    jwt: string,
    sellerType: SellerType = null
  ) {
    const headers: HttpHeaders = {
      "Content-Type": "application/json",
    };

    if (sellerType) {
      headers.Origin = sellerType;
    }

    headers.Authorization = `Bearer ${jwt}`;

    const config: AxiosRequestConfig = {
      baseURL: process.env[`${clientType}_URL`],
      headers,
    };

    const instance = Axios.create(config);

    if (process.env.DEBUG) {
      instance.interceptors.request.use((request) => {
        this.logger.debug(`${clientType} Client - Request`, request);
        return request;
      });

      instance.interceptors.response.use((response) => {
        this.logger.debug(`${clientType} Client - Response`, {
          headers: response.headers,
          data: response.data,
        });
        return response;
      });
    }

    return instance;
  }

  private handleError(error: AxiosError, method: string) {
    this.logger.error(method, error.message);
    return error;
  }
}
