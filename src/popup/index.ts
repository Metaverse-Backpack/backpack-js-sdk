import { EventEmitter } from 'events'

import { SdkError } from '@/errors'

export interface PopupOptions {
  left?: number
  top?: number
  width?: number
  height?: number
  disableIframeFallback?: boolean
}

export default class Popup extends EventEmitter {
  private left: number
  private top: number
  private width: number
  private height: number
  private disableIframeFallback: boolean

  constructor(
    private readonly clientId: string,
    {
      left = -500,
      top = 150,
      height = 350,
      width = 375,
      disableIframeFallback = false,
    }: PopupOptions = {}
  ) {
    super()
    this.left = left
    this.top = top
    this.height = height
    this.width = width
    this.disableIframeFallback = disableIframeFallback
  }

  loadPopup() {
    const popup = window.open('', '_blank', this.popupParams)
    if (!popup || popup.closed || popup.closed === undefined) {
      try {
        popup?.close()
      } catch (error) {}
      if (this.disableIframeFallback) throw new SdkError('user-action-required')
    }
  }

  private get popupParams(): string {
    const { height, width, top, left } = this
    return `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=${width},height=${height},left=${left},top=${top}`
  }
}
