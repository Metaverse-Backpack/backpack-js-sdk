import { SdkError } from '@/errors'
import { AuthorizationResponse, ResponseType } from '@/types'

export interface PopupOptions {
  left?: number
  top?: number
  width?: number
  height?: number
  url?: string
  verbose?: boolean
}

export interface BkpkEvent {
  event: string
  params: unknown
  sender: string
}

export interface BkpkError {
  message: string
  details: unknown
}

export interface PopupEvents<TResponseType extends ResponseType> {
  result: (result: AuthorizationResponse<TResponseType>) => void
  error: (error: SdkError) => void
}
