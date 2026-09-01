import { describe, expect, it } from 'vitest'
import { can, hasRole } from '../config/roles'
import { navigation } from '../config/navigation'

describe('RBAC helpers', () => {
  it('limits administration to admins', () => {
    expect(can.administer('admin')).toBe(true)
    expect(can.administer('analyst')).toBe(false)
  })
  it('checks allowed role collections', () => {
    expect(hasRole('viewer', ['admin', 'viewer'])).toBe(true)
    expect(hasRole('viewer', ['admin', 'analyst'])).toBe(false)
  })

  it('makes the SOC dashboard available to every backend-supported role', () => {
    const dashboard = navigation.find((item) => item.to === '/dashboard')
    expect(dashboard?.roles).toEqual(['admin', 'analyst', 'viewer'])
  })

  it('makes the security event list available to every backend-supported role', () => {
    const events = navigation.find((item) => item.to === '/events')
    expect(events?.roles).toEqual(['admin', 'analyst', 'viewer'])
  })

  it.each(['/alerts', '/incidents', '/threat-intelligence', '/mitre'])(
    'makes %s available to every backend-supported role',
    (path) => {
      const item = navigation.find((entry) => entry.to === path)
      expect(item?.roles).toEqual(['admin', 'analyst', 'viewer'])
    },
  )
})
