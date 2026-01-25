import { describe, expect, it, vi } from 'vitest'
import { checkStorageStatus } from '../storage/storage'

describe('storage status', () => {
  it('returns limited when indexedDB is unavailable', async () => {
    vi.stubGlobal('indexedDB', undefined)
    const result = await checkStorageStatus()
    expect(result).toEqual({ status: 'limited' })
    vi.unstubAllGlobals()
  })
})
