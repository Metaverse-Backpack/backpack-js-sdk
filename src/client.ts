import { ApiError, SdkError } from './errors'

type HttpMethod = 'POST' | 'GET'

interface ErrorResponse {
  code: string
  message: string
}

export default class Client {
  private _accessToken?: string
  private _expiresAt?: Date

  constructor(private readonly apiUrl: string) {}

  public async post<TResponse>(
    endpoint: string,
    body: Record<string, unknown>,
    authorized = false
  ): Promise<TResponse> {
    return await this.fetch<TResponse>('POST', endpoint, authorized, body)
  }

  public async get<TResponse>(
    endpoint: string,
    params: Record<string, string>,
    authorized = false
  ): Promise<TResponse> {
    const urlParams = new URLSearchParams(
      params as unknown as Record<string, string>
    ).toString()
    return await this.fetch<TResponse>('GET', endpoint + urlParams, authorized)
  }

  public get accessToken(): string {
    const { _accessToken: token, _expiresAt: expiresAt } = this
    if (!token) throw new SdkError('no-access-token')
    if (expiresAt && expiresAt <= new Date())
      throw new SdkError('expired-access-token')
    return token
  }

  public set accessToken(accessToken: string) {
    this._accessToken = accessToken
  }

  // eslint-disable-next-line accessor-pairs
  public set expiresAt(expiresAt: Date) {
    this._expiresAt = expiresAt
  }

  private handleError(result: Response): void {
    const { code, message } = result.json() as unknown as ErrorResponse
    throw new ApiError(code, message)
  }

  private async fetch<TResponse>(
    method: HttpMethod,
    endpoint: string,
    authenticated = false,
    body?: unknown
  ): Promise<TResponse> {
    try {
      const url = this.apiUrl + endpoint

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (authenticated) headers.Authorization = `Bearer ${this.accessToken}`

      const result = await fetch(url, {
        body: body ? JSON.stringify(body) : undefined,
        method,
        headers,
      })

      switch (result.status) {
        case 400:
          this.handleError(result)
          break
        case 401:
          throw new SdkError('not-authorized')
        case 403:
          throw new SdkError('forbidden')
        case 429:
          throw new SdkError('rate-limit-reached')
        case 500:
          throw new SdkError('unhandled-server-error')
      }
      return result.json() as unknown as TResponse
    } catch (error) {
      throw new SdkError('network-failure')
    }
  }
}
