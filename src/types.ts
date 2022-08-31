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
  expiresAt: Date
}

export type AuthorizationResponse<T extends ResponseType> = T extends 'token'
  ? TokenAuthorizationResponse
  : CodeAuthorizationResponse

type ValueOf<T> = T[keyof T]

export interface Avatar {
  uri: string
  format: 'glb' | 'fbx' | 'vrm'
  type: 'humanoid'
  provider: keyof ProviderMetadata
  metadata: ValueOf<ProviderMetadata>
  userId: string
}

export interface BackpackItem {
  id: string
  content: string
  source: string
  category: string
  metadata: Avatar
}

export interface BackpackOwnerResponse {
  id: string
  owner: string
  backpackItems: BackpackItem[]
  createdAt: Date
  updatedAt: Date
}
