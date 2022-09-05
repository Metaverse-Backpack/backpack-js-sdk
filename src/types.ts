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

export interface Avatar {
  source: string
  type: 'humanoid' | 'humanoid-male' | 'humanoid-female'
  fileFormat: 'glb' | 'fbx' | 'vrm'
  reference?: string
  bodyType?: 'full-body' | 'half-body'
  boneStructure?: {
    head?: string
  }
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
