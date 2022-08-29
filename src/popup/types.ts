import { SdkError } from '../errors'
import { AuthorizationResponse, ResponseType } from '../types'

export interface PopupOptions {
  left?: number
  top?: number
  width?: number
  height?: number
  url?: string
  verbose?: boolean
  state?: string
}

export interface PopupEvents<TResponseType extends ResponseType> {
  result: (result: AuthorizationResponse<TResponseType>) => void
  error: (error: SdkError) => void
}
