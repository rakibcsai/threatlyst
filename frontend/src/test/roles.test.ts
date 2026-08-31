import { describe, expect, it } from 'vitest'
import { can, hasRole } from '../config/roles'

describe('RBAC helpers', () => {
  it('limits administration to admins', () => {
    expect(can.administer('admin')).toBe(true)
    expect(can.administer('analyst')).toBe(false)
  })
  it('checks allowed role collections', () => {
    expect(hasRole('viewer', ['admin', 'viewer'])).toBe(true)
    expect(hasRole('viewer', ['admin', 'analyst'])).toBe(false)
  })
})
