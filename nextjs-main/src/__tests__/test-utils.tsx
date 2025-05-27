import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import type { PreloadedState } from '@reduxjs/toolkit';
import { api } from '../services/__mocks__/api';

interface AppState {
  [api.reducerPath]: ReturnType<typeof api.reducer>;
}

function createTestStore(preloadedState?: PreloadedState<AppState>) {
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware as any),
    preloadedState,
  });
  return store;
}

type PropsWithChildren = { children: React.ReactNode };

export const renderWithProviders = (
  ui: React.ReactElement,
  {
    store = createTestStore(),
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }: PropsWithChildren) => {
    return <Provider store={store}>{children}</Provider>;
  };

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    store,
  };
};


describe('test-utils', () => {
  it('should create store with initial state', () => {
    const store = createTestStore();
    expect(store.getState()).toHaveProperty(api.reducerPath);
  });
}); 