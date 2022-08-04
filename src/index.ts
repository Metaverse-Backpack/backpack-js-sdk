import { SdkError } from './errors'
import Client from './client'
import { DEFAULT_API_URL } from './constants'
import Popup from './popup'

import {
  AuthorizationOptions,
  AuthorizationResponses,
  Avatar,
  BkpkOptions,
  PaginationOptions,
  PaginationResponse,
  ResponseType,
} from './types'

export default class Bkpk {
  private readonly popup: Popup
  private readonly client: Client

  /**
   *
   * @param clientId Your Experience's client ID for Bkpk
   * @param options Bkpk SDK options
   */
  constructor(
    private readonly clientId: string,
    private readonly options: BkpkOptions = {}
  ) {
    this.popup = new Popup(clientId, options)
    this.client = new Client(options.apiUrl ?? DEFAULT_API_URL)
  }

  /**
   * Prompts the user to authorize your application and returns access credentials
   *
   * @param responseType Desired response type (token by default)
   * @param options Authorization Options
   */
  public async authorize<T extends ResponseType = 'token'>({
    responseType,
    scopes = ['avatars:read'],
    ...options
  }: { responseType?: T } & AuthorizationOptions<T> = {}): Promise<
    AuthorizationResponses<T>
  > {
    // @ts-ignore
    return 'TODO' as AuthorizationResponses<T>
  }

  /**
   * Use this instead of `Bkpk.authorize` if you already have a valid access token
   *
   * @param accessToken A valid Bkpk API access token
   * @param expiresAt The expiration date of the access token
   */
  public setCredentials(accessToken: string, expiresAt?: Date) {
    this.client.accessToken = accessToken
    if (expiresAt) this.client.expiresAt = expiresAt
  }

  /**
   * Returns a paginated list of avatars for the current user
   *
   * @param page
   * @param options
   */
  public async getAvatars(
    page: number = 1,
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
  AuthorizationOptions,
  AuthorizationResponses,
  Avatar,
  BkpkOptions,
  PaginationOptions,
  PaginationResponse,
  ResponseType,
}
