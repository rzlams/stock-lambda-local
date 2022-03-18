import { AxiosError, AxiosRequestConfig } from 'axios'
import Axios from 'axios'
import { StockSkus } from './types'
import { LoggerService } from '../common/logger/logger.service'
import { SellerType, Skus, ClientType, Stock } from '../common/types'

const logger = new LoggerService()

export const httpRepository = {
  pimCheckVariants: async (jwt: string, sellerType: SellerType, data: Skus): Promise<Skus> => {
    try {
      const path = process.env.PIM_CHECK_VARIANTS_PATH as string
      const response = await getClient('PIM', jwt, sellerType).post(path, data)
      return response.data
    } catch (error) {
      throw handleError(error as AxiosError, 'checkVariants')
    }
  },

  stockHandle: async (jwt: string, sellerType: SellerType, data: StockSkus): Promise<Stock> => {
    try {
      const path = process.env.STOCK_HANDLE_PATH as string
      const response = await getClient('STOCK', jwt, sellerType).post(path, data)
      return response.data.stock
    } catch (error) {
      throw handleError(error as AxiosError, 'handleStock')
    }
  },
}

function getClient(clientType: ClientType, jwt: string, sellerType: SellerType = null) {
  const headers: any = { 'Content-Type': 'application/json' }

  if (sellerType) {
    headers.Origin = sellerType
  }

  headers.Authorization = `Bearer ${jwt}`

  const config: AxiosRequestConfig = {
    baseURL: process.env[`${clientType}_URL`],
    headers,
  }

  const instance = Axios.create(config)

  if (process.env.DEBUG) {
    instance.interceptors.request.use((request) => {
      logger.debug(`${clientType} Client - Request`, request)
      return request
    })

    instance.interceptors.response.use((response) => {
      logger.debug(`${clientType} Client - Response`, { headers: response.headers, data: response.data })
      return response
    })
  }

  return instance
}

function handleError(error: AxiosError, method: string) {
  logger.error(method, error.message)
  return error
}
