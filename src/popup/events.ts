export const BkpkEvents = {
  /** Triggered when the close button is clicked */
  CLOSE: 'close',

  /** Triggered by the iframe to console log arbitrary data */
  DEBUG: 'debug',

  /** Triggered when an error occurs in the iframe */
  ERROR: 'error',

  /** Triggered when the iframe is ready to receive messages */
  ONLOAD: 'onload',

  /** Triggered when a result is received */
  RESULT: 'result',
}
