import { describe, it, expect } from 'vitest'

describe('Smoke tests', () => {
  it('loads the i18n module without errors', async () => {
    const { useTranslation } = await import('@/i18n')
    expect(useTranslation).toBeDefined()
    expect(typeof useTranslation).toBe('function')
  })

  it('has all English translation keys present in Hindi', async () => {
    const { en } = await import('@/i18n/translations/en')
    const { hi } = await import('@/i18n/translations/hi')
    const enKeys = Object.keys(en)
    const hiKeys = Object.keys(hi)
    const missing = enKeys.filter((k) => !hiKeys.includes(k))
    expect(missing).toEqual([])
  })

  it('store initializes with default state', async () => {
    const { useStore } = await import('@/store')
    const state = useStore.getState()
    expect(state.language).toBeDefined()
    expect(['en', 'hi']).toContain(state.language)
    expect(state.user).toBeDefined()
  })
})
