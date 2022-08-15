import { ResponseType } from '../types'

export type BkpkResult<T extends ResponseType> = T extends 'token'
  ? {
      token: string
      expires: Date
    }
  : {
      code: string
    }

export interface BkpkError {
  message: string
  details?: unknown
}

export type BkpkEvent = 'close' | 'debug' | 'error' | 'onload' | 'result'

interface BkpkEventParamsMap<TResponseType extends ResponseType>
  extends Record<BkpkEvent, unknown> {
  close: undefined
  debug: unknown[]
  error: BkpkError
  onload: undefined
  result: BkpkResult<TResponseType>
}

export type BkpkEventParams<
  TBkpkEvent extends BkpkEvent,
  TResponseType extends ResponseType
> = BkpkEventParamsMap<TResponseType>[TBkpkEvent]
