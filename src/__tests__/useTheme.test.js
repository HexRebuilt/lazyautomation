import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../hooks/useTheme.jsx';

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('returns light theme by default when no preference', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
  });

  test('returns dark theme when system preference is dark', () => {
    // Mock the media query
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
  });

  test('returns saved theme from localStorage', () => {
    localStorage.setItem('theme', 'dark');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
  });

  test('toggleTheme switches from light to dark', () => {
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.toggleTheme();
    });
    
    expect(result.current.theme).toBe('dark');
  });

  test('toggleTheme switches from dark to light', () => {
    localStorage.setItem('theme', 'dark');
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.toggleTheme();
    });
    
    expect(result.current.theme).toBe('light');
  });

  test('saves theme to localStorage when toggled', () => {
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.toggleTheme();
    });
    
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  test('sets data-theme attribute on document', () => {
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.toggleTheme();
    });
    
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
