import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'

configure({ testIdAttribute: 'data-testid' })

// Мок для fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([])
  })
)

// Мок для window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Мок для IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockImplementation(() => ({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
}));
window.IntersectionObserver = mockIntersectionObserver;

beforeEach(() => {
  // Очищаем моки перед каждым тестом
  jest.clearAllMocks()
})

// Мок для Next.js Head компонента
jest.mock('next/head', () => {
    return {
        __esModule: true,
        default: ({ children }) => {
            return <>{children}</>;
        },
    };
}); 