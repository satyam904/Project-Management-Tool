import '@testing-library/jest-dom'
import { setupServer } from 'msw/node'
import { handlers } from './handlers'
import { beforeAll, afterEach, afterAll, vi } from 'vitest'

export const server = setupServer(...handlers)

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
