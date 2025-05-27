import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AuthenticationModal from '@/src/components/Modals/AuthenticationModal';
import { headerModalSlice } from '@/src/store/slices/headerModalSlice';
import { alertationSlice } from '@/src/store/slices/alertationSlice';

// Мок для next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Мок для js-cookie
jest.mock('js-cookie', () => ({
  set: jest.fn(),
}));

// Мок для компонента регистрации
jest.mock('@/src/components/Header/Registration', () => {
  return function MockRegistration() {
    return <div>Форма регистрации</div>;
  };
});

describe('AuthenticationModal', () => {
  const mockStore = configureStore({
    reducer: {
      headerModal: headerModalSlice.reducer,
      alert: alertationSlice.reducer,
    },
  });

  const defaultProps = {
    open: true,
    handleClose: jest.fn(),
  };

  const renderWithProvider = (props = defaultProps) => {
    return render(
      <Provider store={mockStore}>
        <AuthenticationModal {...props} />
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('отображает форму авторизации по умолчанию', () => {
    renderWithProvider();
    expect(screen.getByText('Авторизация')).toBeInTheDocument();
  });

  test('переключается между формами регистрации и авторизации', async () => {
    renderWithProvider();
    
    // Проверяем начальное состояние (авторизация)
    expect(screen.getByText('Авторизация')).toBeInTheDocument();
    
    // Кликаем на ссылку регистрации
    const registrationLink = screen.getByText('Регистрация', { selector: 'span' });
    fireEvent.click(registrationLink);
    
    // Проверяем, что отображается форма регистрации
    await waitFor(() => {
      expect(screen.getByText('Форма регистрации')).toBeInTheDocument();
    });
  });

  test('показывает ошибку при неверных данных авторизации', async () => {
    renderWithProvider();
    
    const emailInput = screen.getByLabelText('Электронная почта');
    const passwordInput = screen.getByLabelText('Пароль');
    const loginButton = screen.getByText('Войти');

    fireEvent.change(emailInput, { target: { value: 'wrong@email.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    
    await waitFor(() => {
      fireEvent.click(loginButton);
    });
    
    // Проверяем, что появилось сообщение об ошибке
    expect(screen.getAllByText('Не верный логин или пароль')[0]).toBeInTheDocument();
  });

  test('успешная авторизация админа', async () => {
    renderWithProvider();
    
    const emailInput = screen.getByLabelText('Электронная почта');
    const passwordInput = screen.getByLabelText('Пароль');
    const loginButton = screen.getByText('Войти');

    fireEvent.change(emailInput, { target: { value: 'admin@ipu.ru' } });
    fireEvent.change(passwordInput, { target: { value: '12345678' } });
    
    await waitFor(() => {
      fireEvent.click(loginButton);
    });
    
    // Проверяем, что был вызван метод установки cookie
    expect(require('js-cookie').set).toHaveBeenCalledWith('token', 'demo-token', { expires: 7 });
  });
}); 