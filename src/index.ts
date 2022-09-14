import Client from './client'
import { DEFAULT_API_URL } from './constants'
import { SdkError } from './errors'
import Popup from './popup'

import {
  AuthorizationResponse,
  Avatar,
  BkpkOptions,
  BackpackOwnerResponse,
  ResponseType,
  BackpackItem,
} from './types'

export default class Bkpk {
  private readonly _client: Client | null = null

  /**
   *
   * @param clientId Your Experience's client ID for Bkpk
   * @param options Bkpk SDK options
   */
  constructor(
    private readonly clientId: string,
    private readonly options: BkpkOptions = {}
  ) {
    if (!window) return // Support SSR
    this._client = new Client(options.apiUrl ?? DEFAULT_API_URL)
  }

  private get client(): Client {
    if (!this._client) throw new SdkError('ssr-environment')
    return this._client
  }

  /**
   * Prompts the user to authorize your application and returns access credentials
   *
   * @param [responseType] Desired response type (token by default)
   */
  public async authorize<T extends ResponseType = 'token'>(
    responseType?: T
  ): Promise<AuthorizationResponse<T>> {
    const normalizedResponseType = responseType ?? ('token' as T)

    const popup = new Popup<T>(
      this.clientId,
      normalizedResponseType,
      this.options
    )

    const result = await new Promise<AuthorizationResponse<T>>(
      (resolve, reject) => {
        popup.on('result', result => resolve(result))
        popup.on('error', error => reject(error))
      }
    )

    if (normalizedResponseType === 'token') {
      const { token, expiresAt } = result as AuthorizationResponse<'token'>
      this.setCredentials(token, expiresAt)
    }

    return result
  }

  /**
   * Use this instead of `Bkpk.authorize` if you already have a valid access token
   *
   * @param accessToken A valid Bkpk API access token
   * @param expiresAt The expiration date of the access token
   */
  public setCredentials(accessToken: string, expiresAt?: Date): void {
    this.client.accessToken = accessToken
    if (expiresAt) this.client.expiresAt = expiresAt
  }

  /**
   * Returns list of avatars for the current user
   */
  public async getAvatars(): Promise<BackpackItem[]> {
    // TODO: Update this to use a paginated endpoint or GraphQL endpoint
    const response = await this.client.get<BackpackOwnerResponse>(
      '/backpack/owner',
      {},
      true
    )
    return response.backpackItems
  }

  /**
   * Returns the default avatar for the current user
   */
  public async getDefaultAvatar(): Promise<BackpackItem> {
    const avatars = await this.getAvatars()
    if (!avatars.length) throw new SdkError('no-avatars-available')
    return avatars[0]
  }
}

export { AuthorizationResponse, Avatar, Bkpk, BkpkOptions, ResponseType }
