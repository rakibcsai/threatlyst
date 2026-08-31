import { describe, expect, it } from 'vitest'
import { authStorage } from '../lib/auth-storage'

describe('authStorage', () => {
  it('stores and clears a token in memory', () => {
    authStorage.set('test-token')
    expect(authStorage.get()).toBe('test-token')
    authStorage.clear()
    expect(authStorage.get()).toBeNull()
  })
})
