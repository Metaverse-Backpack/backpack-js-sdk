import { ProviderMetadata } from '@bkpk/providers'

import { PopupOptions } from './popup'

export interface BkpkOptions extends PopupOptions {
  url?: string
  apiUrl?: string
}

export type ResponseType = 'code' | 'token'

export interface BaseAuthorizationOptions {
  // responseType?: T
  scopes?: string[]
}

export interface TokenAuthorizationOptions extends BaseAuthorizationOptions {}

export interface CodeAuthorizationOptions extends BaseAuthorizationOptions {
  state?: string
}

export type AuthorizationOptions<T extends ResponseType> = T extends 'token'
  ? TokenAuthorizationOptions
  : CodeAuthorizationOptions

export interface CodeAuthorizationResponse {
  code: string
  state: string
}

export interface TokenAuthorizationResponse {
  token: string
  expires: Date
}

export type AuthorizationResponses<T extends ResponseType> = T extends 'token'
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
