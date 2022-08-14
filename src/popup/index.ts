import { EventEmitter } from 'events'

import { DEFAULT_URL, SENDER_TAG, REQUIRED_SCOPES, SDK_TAG } from '@/constants'
import { SdkError } from '@/errors'
import type { AuthorizationResponse, ResponseType } from '@/types'

import { BkpkEvents } from './events'
import type { PopupOptions, BkpkEvent, BkpkError, PopupEvents } from './types'

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
    this.loadPopup()
  }

  private get popupParams(): string {
    const { height, width, top, left } = this
    return `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=${width},height=${height},left=${left},top=${top}`
  }

  private get authorizationUrl(): string {
    const { clientId, url, responseType } = this
    const params = new URLSearchParams({
      clientId,
      responseType,
      scopes: REQUIRED_SCOPES.join(','),
    }).toString()
    return `${url}/authorize?${params}`
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

  private handleWindowMessage({ data, origin }: MessageEvent): unknown {
    if (origin !== this.url) return
    const { event, params, sender } = this.parseMessage(data)
    if (sender !== SENDER_TAG) return
    switch (event) {
      case BkpkEvents.DEBUG:
        // eslint-disable-next-line no-console
        return console.log(...(params as unknown[]))

      case BkpkEvents.ERROR:
        return this.onBkpkError(params as BkpkError)

      case BkpkEvents.CLOSE:
        return this.onWindowClose()

      case BkpkEvents.RESULT:
        this.onTerminalEvent()
        return this.emit(
          'result',
          params as AuthorizationResponse<TResponseType>
        )
    }
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

  private parseMessage(data: string): BkpkEvent {
    try {
      return JSON.parse(data)
    } catch (error) {
      return {
        event: 'ignore',
        params: null,
        sender: 'none',
      }
    }
  }
}

export default Popup
