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

export interface BkpkError {
  message: string
  details: unknown
}

export interface PopupEvents<TResponseType extends ResponseType> {
  result: (result: AuthorizationResponse<TResponseType>) => void
  error: (error: SdkError) => void
}

interface BaseEvent {
  sender: string
  event: string
  params: unknown
}

interface CloseEvent extends BaseEvent {
  event: 'close'
  params: never
}

interface DebugEvent extends BaseEvent {
  event: 'debug'
  params: unknown[]
}

interface ErrorEvent extends BaseEvent {
  event: 'error'
  params: BkpkError
}

interface OnloadEvent extends BaseEvent {
  event: 'onload'
  params: never
}

interface ResultEvent<TResponseType extends ResponseType> extends BaseEvent {
  event: 'result'
  params: AuthorizationResponse<TResponseType>
}

export type BkpkEvent<TResponseType extends ResponseType> =
  | CloseEvent
  | DebugEvent
  | ErrorEvent
  | OnloadEvent
  | ResultEvent<TResponseType>
