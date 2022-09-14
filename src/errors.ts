import { SDK_TAG } from './constants'

export type SdkErrorCode =
  | 'expired-access-token'
  | 'no-access-token'
  | 'network-failure'
  | 'not-authorized'
  | 'forbidden'
  | 'rate-limit-reached'
  | 'unhandled-server-error'
  | 'no-avatars-available'
  | 'user-action-required'
  | 'window-closed'
  | 'unhandled-bkpk-error'
  | 'ssr-environment'

const MESSAGES: Record<SdkErrorCode, string> = {
  'expired-access-token':
    'Your access token is expired. Please request a new one using `Bkpk.authorize()`',
  'network-failure': 'There was a problem connecting to the API',
  'no-access-token':
    'You must authorize the user first (use `Bkpk.authorize()`)',
  forbidden: 'You are not authorized to access that resource',
  'rate-limit-reached': `You've hit the API rate limit, please try again later`,
  'unhandled-server-error': 'Unhandled Server Error',
  'not-authorized':
    'Your access token is invalid, please reauthenticate the user',
  'no-avatars-available': 'No avatars available for this user',
  'user-action-required': 'A user action must trigger `Bkpk.authorize()`',
  'unhandled-bkpk-error': 'Unhandled Error on Bkpk Client',
  'window-closed': 'Window closed before user authorized your application',
  'ssr-environment': 'The Bkpk SDK will not work in an SSR environment',
}

class BkpkError extends Error {
  constructor(message: string) {
    super(`[${SDK_TAG}] ${message}`)
  }
}

export class SdkError extends BkpkError {
  constructor(public code: SdkErrorCode) {
    super(MESSAGES[code])
  }
}

// Errors returned from API, not handled by SDK
export class ApiError extends BkpkError {
  constructor(public code: string, message: string) {
    super(message)
  }
}
