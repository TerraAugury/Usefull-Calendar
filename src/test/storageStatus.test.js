import { describe, expect, it, vi } from 'vitest'
import { checkStorageStatus } from '../storage/storage'
import { db } from '../storage/dexieDb'

describe('storage status', () => {
  it('returns limited when db.open throws', async () => {
    const openSpy = vi.spyOn(db, 'open').mockRejectedValue(new Error('fail'))
    const result = await checkStorageStatus()
    expect(result).toEqual({ status: 'limited' })
    openSpy.mockRestore()
  })
})
