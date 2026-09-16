import { describe, it, expect } from 'vitest'
import {
  ErrorCode,
  StellumioError,
  NetworkError,
  AnchorError,
  UserError,
  TimeoutError,
  isStellumioError,
  isNetworkError,
  isAnchorError,
  isUserError,
  isTimeoutError,
} from '@/lib/stellar/errors'

// ─── instanceof checks ────────────────────────────────────────────────────────

describe('StellumioError hierarchy — instanceof', () => {
  it('NetworkError is a StellumioError', () => {
    const err = new NetworkError('unreachable')
    expect(err).toBeInstanceOf(StellumioError)
    expect(err).toBeInstanceOf(NetworkError)
  })

  it('AnchorError is a StellumioError', () => {
    const err = new AnchorError('bad response', ErrorCode.ANCHOR_HTTP_ERROR, 400)
    expect(err).toBeInstanceOf(StellumioError)
    expect(err).toBeInstanceOf(AnchorError)
  })

  it('UserError is a StellumioError', () => {
    const err = new UserError('rejected', ErrorCode.USER_REJECTED)
    expect(err).toBeInstanceOf(StellumioError)
    expect(err).toBeInstanceOf(UserError)
  })

  it('TimeoutError is a StellumioError', () => {
    const err = new TimeoutError('timed out')
    expect(err).toBeInstanceOf(StellumioError)
    expect(err).toBeInstanceOf(TimeoutError)
  })
})

// ─── Stable error codes ───────────────────────────────────────────────────────

describe('StellumioError hierarchy — stable codes', () => {
  it('NetworkError defaults to NETWORK_UNREACHABLE', () => {
    expect(new NetworkError('x').code).toBe(ErrorCode.NETWORK_UNREACHABLE)
  })

  it('NetworkError accepts NETWORK_MISMATCH', () => {
    expect(new NetworkError('x', ErrorCode.NETWORK_MISMATCH).code).toBe(ErrorCode.NETWORK_MISMATCH)
  })

  it('AnchorError defaults to ANCHOR_HTTP_ERROR', () => {
    expect(new AnchorError('x').code).toBe(ErrorCode.ANCHOR_HTTP_ERROR)
  })

  it('AnchorError accepts ANCHOR_INVALID_RESPONSE', () => {
    expect(new AnchorError('x', ErrorCode.ANCHOR_INVALID_RESPONSE).code).toBe(
      ErrorCode.ANCHOR_INVALID_RESPONSE
    )
  })

  it('AnchorError accepts ANCHOR_RATE_UNAVAILABLE', () => {
    expect(new AnchorError('x', ErrorCode.ANCHOR_RATE_UNAVAILABLE).code).toBe(
      ErrorCode.ANCHOR_RATE_UNAVAILABLE
    )
  })

  it('UserError defaults to USER_REJECTED', () => {
    expect(new UserError('x').code).toBe(ErrorCode.USER_REJECTED)
  })

  it('UserError accepts USER_WALLET_MISSING', () => {
    expect(new UserError('x', ErrorCode.USER_WALLET_MISSING).code).toBe(
      ErrorCode.USER_WALLET_MISSING
    )
  })

  it('TimeoutError always has REQUEST_TIMEOUT', () => {
    expect(new TimeoutError('x').code).toBe(ErrorCode.REQUEST_TIMEOUT)
  })
})

// ─── Type guards ──────────────────────────────────────────────────────────────

describe('type guards', () => {
  it('isStellumioError returns true for all subclasses', () => {
    expect(isStellumioError(new NetworkError('x'))).toBe(true)
    expect(isStellumioError(new AnchorError('x'))).toBe(true)
    expect(isStellumioError(new UserError('x'))).toBe(true)
    expect(isStellumioError(new TimeoutError('x'))).toBe(true)
  })

  it('isStellumioError returns false for plain Error', () => {
    expect(isStellumioError(new Error('x'))).toBe(false)
    expect(isStellumioError(null)).toBe(false)
    expect(isStellumioError('string')).toBe(false)
  })

  it('isNetworkError narrows correctly', () => {
    expect(isNetworkError(new NetworkError('x'))).toBe(true)
    expect(isNetworkError(new AnchorError('x'))).toBe(false)
  })

  it('isAnchorError narrows correctly', () => {
    expect(isAnchorError(new AnchorError('x'))).toBe(true)
    expect(isAnchorError(new NetworkError('x'))).toBe(false)
  })

  it('isUserError narrows correctly', () => {
    expect(isUserError(new UserError('x'))).toBe(true)
    expect(isUserError(new TimeoutError('x'))).toBe(false)
  })

  it('isTimeoutError narrows correctly', () => {
    expect(isTimeoutError(new TimeoutError('x'))).toBe(true)
    expect(isTimeoutError(new UserError('x'))).toBe(false)
  })
})

// ─── Exhaustive switch over error codes ───────────────────────────────────────

describe('exhaustive switch over error codes', () => {
  /**
   * This helper must handle every ErrorCode value.
   * TypeScript will error at compile time if a case is missing (never check).
   */
  function classify(err: StellumioError): string {
    switch (err.code) {
      case ErrorCode.NETWORK_UNREACHABLE:
        return 'network-unreachable'
      case ErrorCode.NETWORK_MISMATCH:
        return 'network-mismatch'
      case ErrorCode.ANCHOR_HTTP_ERROR:
        return 'anchor-http'
      case ErrorCode.ANCHOR_INVALID_RESPONSE:
        return 'anchor-invalid'
      case ErrorCode.ANCHOR_RATE_UNAVAILABLE:
        return 'anchor-rate'
      case ErrorCode.USER_REJECTED:
        return 'user-rejected'
      case ErrorCode.USER_WALLET_MISSING:
        return 'user-wallet-missing'
      case ErrorCode.REQUEST_TIMEOUT:
        return 'timeout'
      default: {
        // Exhaustiveness check — TypeScript will flag unhandled codes here
        const _exhaustive: never = err.code
        return _exhaustive
      }
    }
  }

  it('routes each error code to the correct branch', () => {
    expect(classify(new NetworkError('x', ErrorCode.NETWORK_UNREACHABLE))).toBe('network-unreachable')
    expect(classify(new NetworkError('x', ErrorCode.NETWORK_MISMATCH))).toBe('network-mismatch')
    expect(classify(new AnchorError('x', ErrorCode.ANCHOR_HTTP_ERROR))).toBe('anchor-http')
    expect(classify(new AnchorError('x', ErrorCode.ANCHOR_INVALID_RESPONSE))).toBe('anchor-invalid')
    expect(classify(new AnchorError('x', ErrorCode.ANCHOR_RATE_UNAVAILABLE))).toBe('anchor-rate')
    expect(classify(new UserError('x', ErrorCode.USER_REJECTED))).toBe('user-rejected')
    expect(classify(new UserError('x', ErrorCode.USER_WALLET_MISSING))).toBe('user-wallet-missing')
    expect(classify(new TimeoutError('x'))).toBe('timeout')
  })
})

// ─── AnchorError extra fields ─────────────────────────────────────────────────

describe('AnchorError extra fields', () => {
  it('carries httpStatus and raw payload', () => {
    const raw = { error: 'bad' }
    const err = new AnchorError('bad', ErrorCode.ANCHOR_HTTP_ERROR, 422, raw)
    expect(err.httpStatus).toBe(422)
    expect(err.raw).toBe(raw)
  })

  it('defaults httpStatus to 0 and raw to null', () => {
    const err = new AnchorError('bad')
    expect(err.httpStatus).toBe(0)
    expect(err.raw).toBeNull()
  })
})
