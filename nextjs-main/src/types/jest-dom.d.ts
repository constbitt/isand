/// <reference types="@testing-library/jest-dom" />

declare namespace jest {
  interface Matchers<R> {
    toBeInTheDocument(): R;
    toHaveTextContent(text: string | RegExp): R;
    toBeVisible(): R;
    toHaveClass(className: string): R;
    toHaveStyle(css: { [key: string]: any }): R;
  }
} 