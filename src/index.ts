import Client from './client'
import { DEFAULT_API_URL } from './constants'
import { SdkError } from './errors'
import Popup from './popup'

import {
  AuthorizationResponse,
  Avatar,
  BkpkOptions,
  PaginationOptions,
  PaginationResponse,
  ResponseType,
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
    const popup = new Popup<T>(
      this.clientId,
      responseType ?? ('token' as T),
      this.options
    )

    const result = await new Promise<AuthorizationResponse<T>>(
      (resolve, reject) => {
        popup.on('result', result => resolve(result))
        popup.on('error', error => reject(error))
      }
    )

    if (responseType === 'token') {
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
   * Returns a paginated list of avatars for the current user
   *
   * @param page Page number
   * @param [options] Pagination options
   * @param [options.limit] Number of avatars per page
   */
  public async getAvatars(
    page = 1,
    { limit = 10 }: PaginationOptions = {}
  ): Promise<PaginationResponse<Avatar>> {
    return await this.client.get<PaginationResponse<Avatar>>('/avatars', {
      limit: `${limit}`,
      page: `${page}`,
    })
  }

  /**
   * Returns the default avatar for the current user
   */
  public async getDefaultAvatar(): Promise<Avatar> {
    const { results } = await this.getAvatars()
    if (!results.length) throw new SdkError('no-avatars-available')
    return results[0]
  }
}

export {
  AuthorizationResponse,
  Avatar,
  Bkpk,
  BkpkOptions,
  PaginationOptions,
  PaginationResponse,
  ResponseType,
}
