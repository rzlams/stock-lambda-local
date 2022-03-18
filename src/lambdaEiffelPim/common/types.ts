export interface StockItem {
  sku: string
  quantity: number
}

export interface StockSkus {
  skus: StockItem[]
}

export interface Skus {
  sku: string[]
}

export interface Event {
  headers: Record<string, string>
  body: StockSkus
}

export interface Stock {}

// alaways keep null at the end of this array to avoid use it on tests
export const sellerTypes = ['multivende', 'centry', null] as const
export type SellerType = typeof sellerTypes[number]

export type ClientType = 'PIM' | 'STOCK'
