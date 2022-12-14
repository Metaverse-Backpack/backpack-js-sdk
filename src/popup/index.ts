import { EventEmitter } from 'events'

import { DEFAULT_URL, REQUIRED_SCOPES, SDK_TAG } from '../constants'
import { SdkError } from '../errors'
import type { AuthorizationResponse, ResponseType } from '../types'
import { createToken } from '../utils'

import type { PopupOptions, PopupEvents } from './types'

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
  private redirectCheckInterval: NodeJS.Timer | null = null
  private readonly state: string

  constructor(
    private readonly clientId: string,
    private readonly responseType: TResponseType,
    {
      left = -500,
      top = -150,
      height = 550,
      width = 375,
      url = DEFAULT_URL,
      verbose = false,
      state,
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
    this.state = state ?? createToken(10)
    this.loadPopup()
  }

  private get popupParams(): string {
    const { height, width, top, left } = this
    return `popup=yes,scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=${width},height=${height},screenX=${left},screenY=${top}`
  }

  private get redirectUri(): string {
    return window.location.origin
  }

  private get authorizationUrl(): string {
    const { clientId, url, responseType, redirectUri, state } = this
    const params: Record<string, string> = {
      client_id: clientId,
      response_type: responseType,
      redirect_uri: redirectUri,
      scope: REQUIRED_SCOPES.join(','),
    }
    if (responseType === 'code') params.state = state
    return `${url}/oauth/authorize?${new URLSearchParams(params).toString()}`
  }

  private loadPopup(recursed = false): void {
    const reattemptPopupHandler = (): void => this.loadPopup(true)
    this.popup = window.open('', '_blank', this.popupParams)
    if (!this.popup || this.popup.closed || this.popup.closed === undefined) {
      try {
        this.popup?.close()
      } catch (error) {
        // do nothing
      }

      if (recursed) throw new SdkError('user-action-required')

      // Try to load the popup the next time the user clicks on the page
      window.addEventListener('click', reattemptPopupHandler)

      return
    }

    try {
      window.removeEventListener('click', reattemptPopupHandler)
    } catch (error) {
      // do nothing
    }

    this.popup.location.href = this.authorizationUrl

    this.windowClosedCheckInterval = setInterval(() => {
      if (this.popup?.closed) this.onWindowClose()
    })

    this.redirectCheckInterval = setInterval(() => this.checkForRedirect())
  }

  private checkForRedirect(): void {
    try {
      const currentWindowUri = this.popup?.location.origin
      if (currentWindowUri !== this.redirectUri) return
    } catch (error) {
      return
    }

    const query = new Proxy(new URLSearchParams(this.popup?.location.search), {
      get: (searchParams, prop) => searchParams.get(prop as string),
    })

    this.onTerminalEvent()

    const [tokenType, accessToken, expiresIn, code, state, error] = [
      'token_type',
      'access_token',
      'expires_in',
      'code',
      'state',
      'error',
      // @ts-expect-error This is a valid key
    ].map(key => query[key as keyof typeof query] as string)

    if (error) return this.onError(error)
    if (tokenType === 'Bearer')
      return this.onAccessToken(accessToken, expiresIn)
    return this.onAuthorizationCode(code, state)
  }

  private onAccessToken(token: string, expiresIn: string): void {
    if (this.responseType !== 'token')
      return this.onError('Invalid Response Type Returned from Bkpk')
    const expiresAt = new Date(
      new Date().getTime() + parseInt(expiresIn) * 1000
    )

    this.emit('result', {
      token,
      expiresAt,
    } as unknown as AuthorizationResponse<TResponseType>)
  }

  private onAuthorizationCode(code: string, state: string): void {
    if (this.responseType !== 'code')
      return this.onError('Invalid Response Type Returned from Bkpk')

    this.emit('result', {
      code,
      state,
    } as unknown as AuthorizationResponse<TResponseType>)
  }

  private onError(errorMessage: string): void {
    // eslint-disable-next-line no-console
    if (this.verbose) console.error(`${SDK_TAG} ${errorMessage}`)
    this.emit('error', new SdkError('unhandled-bkpk-error'))
  }

  private onWindowClose(): void {
    this.onTerminalEvent()
    this.emit('error', new SdkError('window-closed'))
  }

  private onTerminalEvent(): void {
    // Stop polling for window closing
    if (this.windowClosedCheckInterval)
      clearInterval(this.windowClosedCheckInterval)
    if (this.redirectCheckInterval) clearInterval(this.redirectCheckInterval)

    // Clear popup
    this.popup?.close()
    this.popup = null
  }
}

export default Popup
