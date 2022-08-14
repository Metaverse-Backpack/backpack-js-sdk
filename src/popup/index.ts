import { EventEmitter } from 'events'

import { DEFAULT_URL, SENDER_TAG, REQUIRED_SCOPES, SDK_TAG } from '@/constants'
import { SdkError } from '@/errors'
import type { AuthorizationResponse, ResponseType } from '@/types'
import { createToken } from '@/utils'

import type {
  PopupOptions,
  BkpkEvent,
  BkpkError,
  PopupEvents,
  BkpkResult,
} from './types'

export { PopupOptions }

declare interface Popup<TResponseType extends ResponseType> {
  on: <U extends keyof PopupEvents<TResponseType>>(
    event: U,
    listener: PopupEvents<TResponseType>[U]
  ) => this

  emit: <U extends keyof PopupEvents<TResponseType>>(
    event: U,
    ...args: Parameters<PopupEvents<TResponseType>[U]>
  ) => boolean
}

class Popup<TResponseType extends ResponseType> extends EventEmitter {
  private readonly left: number
  private readonly top: number
  private readonly width: number
  private readonly height: number
  private readonly url: string
  private popup: Window | null = null
  private readonly verbose: boolean
  private windowClosedCheckInterval: NodeJS.Timer | null = null
  private readonly state: string | null = null

  constructor(
    private readonly clientId: string,
    private readonly responseType: TResponseType,
    {
      left = -500,
      top = 150,
      height = 350,
      width = 375,
      url = DEFAULT_URL,
      verbose = false,
    }: PopupOptions = {}
  ) {
    super()
    this.left = left
    this.top = top
    this.height = height
    this.width = width
    this.url = url
    this.responseType = responseType
    this.verbose = verbose
    if (responseType === 'code') this.state = createToken(10)
    this.loadPopup()
  }

  private get popupParams(): string {
    const { height, width, top, left } = this
    return `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=${width},height=${height},left=${left},top=${top}`
  }

  private get authorizationUrl(): string {
    const { clientId, url, responseType, state } = this
    const params: Record<string, string> = {
      clientId,
      responseType,
      scopes: REQUIRED_SCOPES.join(','),
    }
    if (state) params.state = state
    return `${url}/authorize?${new URLSearchParams(params).toString()}`
  }

  private loadPopup(): void {
    this.popup = window.open('', '_blank', this.popupParams)
    if (!this.popup || this.popup.closed || this.popup.closed === undefined) {
      try {
        this.popup?.close()
      } catch (error) {
        // do nothing
      }
      throw new SdkError('user-action-required')
    }

    this.popup.location.href = this.authorizationUrl

    this.windowClosedCheckInterval = setInterval(() => {
      if (this.popup?.closed) this.onWindowClose()
    }, 1)

    window.addEventListener('message', this.handleWindowMessage)
  }

  private handleWindowMessage(messageEvent: MessageEvent): unknown {
    const message = this.parseMessage(messageEvent)
    if (!message) return
    const { event, params } = message
    switch (event) {
      case 'debug':
        if (!this.verbose) return
        // eslint-disable-next-line no-console
        return console.log(...params)

      case 'error':
        return this.onBkpkError(params)

      case 'close':
        return this.onWindowClose()

      case 'result':
        return this.onResult(params)
    }
  }

  private onResult(params: BkpkResult<TResponseType>): void {
    this.onTerminalEvent()
    const result =
      this.responseType === 'code'
        ? {
            state: this.state as string,
            code: (params as BkpkResult<'code'>).code,
          }
        : params

    this.emit('result', result as AuthorizationResponse<TResponseType>)
  }

  private onBkpkError(params: BkpkError): void {
    const { details, message } = params
    // eslint-disable-next-line no-console
    if (this.verbose) console.error(`${SDK_TAG} ${message}`, details)
    this.onTerminalEvent()
    this.emit('error', new SdkError('unhandled-bkpk-error'))
  }

  private onWindowClose(): void {
    this.onTerminalEvent()
    this.emit('error', new SdkError('window-closed'))
  }

  private onTerminalEvent(): void {
    // Stop polling for window closing
    if (this.windowClosedCheckInterval) {
      clearInterval(this.windowClosedCheckInterval)
      this.windowClosedCheckInterval = null
    }

    // Clear popup
    this.popup?.close()
    this.popup = null

    // Remove window message listener
    window.removeEventListener('message', this.handleWindowMessage)
  }

  private parseMessage({
    data,
    origin,
  }: MessageEvent): BkpkEvent<TResponseType> | null {
    if (origin !== this.url) return null
    try {
      const event = JSON.parse(data)
      if (event.sender !== SENDER_TAG) return null
      return event
    } catch (error) {
      return null
    }
  }
}

export default Popup
