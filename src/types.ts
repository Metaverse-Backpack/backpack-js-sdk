import { ProviderMetadata } from '@bkpk/providers'

import { PopupOptions } from './popup'

export interface BkpkOptions extends PopupOptions {
  apiUrl?: string
}

export type ResponseType = 'code' | 'token'

export interface CodeAuthorizationResponse {
  code: string
  state: string
}

export interface TokenAuthorizationResponse {
  token: string
  expires: Date
}

export type AuthorizationResponse<T extends ResponseType> = T extends 'token'
  ? TokenAuthorizationResponse
  : CodeAuthorizationResponse

export interface PaginationResponse<T> {
  pageCount: number
  total: number
  page: number
  results: T[]
}

export interface PaginationOptions {
  limit?: number
}

type ValueOf<T> = T[keyof T]

export interface Avatar {
  uri: string
  format: 'glb' | 'fbx' | 'vrm'
  type: 'humanoid'
  provider: keyof ProviderMetadata
  metadata: ValueOf<ProviderMetadata>
  userId: string
}
