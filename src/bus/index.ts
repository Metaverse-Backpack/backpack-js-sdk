import { SENDER_TAG } from '../constants'
import { ResponseType } from '../types'

import { BkpkEvent, BkpkError, BkpkResult, BkpkEventParams } from './types'

export { BkpkEvent, BkpkError, BkpkResult, BkpkEventParams }

class BkpkBus {
  private readonly _responseType: string
  private readonly _state?: string
  private readonly _scopes: string[]
  private readonly _clientId: string

  constructor() {
    const urlParams = new URLSearchParams(window.location.search)

    const responseType = urlParams.get('responseType') ?? 'token'
    const state = urlParams.get('state') ?? undefined
    const scopes = urlParams.get('scopes')?.split(',') ?? []
    const clientId = urlParams.get('clientId')

    if (responseType !== 'code' && responseType !== 'token')
      this.throwValidationError('responseType')

    if (!clientId) this.throwValidationError('clientId')

    this._responseType = responseType as ResponseType
    this._state = state
    this._scopes = scopes
    this._clientId = clientId as string

    this.send('onload', undefined)
  }

  public get clientId(): string {
    return this._clientId
  }

  public get state(): string | undefined {
    return this._state
  }

  public get scopes(): string[] {
    return this.scopes
  }

  public get responseType(): string {
    return this._responseType
  }

  public debug(...args: unknown[]): void {
    this.send('debug', args)
  }

  public result<TResponseType extends ResponseType>(
    responseType: TResponseType,
    result: BkpkResult<TResponseType>
  ): void {
    this.send<'result', TResponseType>('result', result)
  }

  public error(message: string, details?: unknown): void {
    this.send('error', { message, details })
  }

  public close(): void {
    this.send('close', undefined)
  }

  private send<
    T extends BkpkEvent,
    TResponseType extends ResponseType = 'token'
  >(event: T, params: BkpkEventParams<T, TResponseType>): void {
    window.postMessage(
      {
        origin: SENDER_TAG,
        event,
        params,
      },
      '*'
    )
  }

  private throwValidationError(param: string): void {
    this.error(`Invalid or missing '${param}'`)
  }
}

export default BkpkBus
