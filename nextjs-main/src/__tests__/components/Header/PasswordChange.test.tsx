import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import PasswordChange from '@/src/components/Header/PasswordChange';
import { alertationSlice } from '@/src/store/slices/alertationSlice';

describe('PasswordChange', () => {
    const mockOnResetPassword = jest.fn();
    
    const renderWithRedux = (component: React.ReactElement) => {
        const store = configureStore({
            reducer: {
                alertation: alertationSlice.reducer
            },
            preloadedState: {
                alertation: {
                    message: '',
                    severity: 'success',
                    open: false,
                    autoHideDuration: 3000
                }
            }
        });
        
        return { ...render(
            <Provider store={store}>
                {component}
            </Provider>
        ), store };
    };

    beforeEach(() => {
        mockOnResetPassword.mockClear();
    });

    it('должен отображать все необходимые поля формы', () => {
        renderWithRedux(<PasswordChange onResetPassword={mockOnResetPassword} />);

        expect(screen.getByLabelText('Электронная почта')).toBeInTheDocument();
        expect(screen.getByLabelText('Код с почты')).toBeInTheDocument();
        expect(screen.getByLabelText('Новый пароль')).toBeInTheDocument();
        expect(screen.getByLabelText('Подтвердите пароль')).toBeInTheDocument();
        expect(screen.getByText('Отправить код')).toBeInTheDocument();
    });

    it('должен иметь кликабельную кнопку "Отправить код" и показывать ошибку при пустом email', async () => {
        const { store } = renderWithRedux(<PasswordChange onResetPassword={mockOnResetPassword} />);
        
        const button = screen.getByText('Отправить код');
        expect(button).toBeEnabled();
        fireEvent.click(button);
        
        await waitFor(() => {
            const state = store.getState();
            expect(state.alertation.message).toBe('Введите email');
            expect(state.alertation.severity).toBe('error');
        });
    });

    it('должен правильно обрабатывать ввод кода подтверждения', async () => {
        const { store } = renderWithRedux(<PasswordChange onResetPassword={mockOnResetPassword} />);

        const emailInput = screen.getByLabelText('Электронная почта');
        const codeInput = screen.getByLabelText('Код с почты');
        
        // Вводим правильный email и отправляем код
        fireEvent.change(emailInput, { target: { value: 'admin@ipu.ru' } });
        fireEvent.click(screen.getByText('Отправить код'));
        
        // Проверяем успешную отправку кода
        await waitFor(() => {
            const state = store.getState();
            expect(state.alertation.message).toBe('Код отправлен');
            expect(state.alertation.severity).toBe('success');
        });
        
        // Вводим неверный код
        fireEvent.change(codeInput, { target: { value: '1111' } });
        await waitFor(() => {
            const state = store.getState();
            expect(state.alertation.message).toBe('Неверный код');
            expect(state.alertation.severity).toBe('error');
        });
        
        // Вводим правильный код
        fireEvent.change(codeInput, { target: { value: '1234' } });
        await waitFor(() => {
            const state = store.getState();
            expect(state.alertation.message).toBe('Почта подтверждена');
            expect(state.alertation.severity).toBe('success');
        });
    });

    it('должен проверять валидацию пароля', async () => {
        const { store } = renderWithRedux(<PasswordChange onResetPassword={mockOnResetPassword} />);

        // Подготавливаем форму (подтверждаем email)
        const emailInput = screen.getByLabelText('Электронная почта');
        const codeInput = screen.getByLabelText('Код с почты');
        fireEvent.change(emailInput, { target: { value: 'admin@ipu.ru' } });
        fireEvent.click(screen.getByText('Отправить код'));
        fireEvent.change(codeInput, { target: { value: '1234' } });

        const newPasswordInput = screen.getByLabelText('Новый пароль');
        const confirmPasswordInput = screen.getByLabelText('Подтвердите пароль');

        // Проверяем короткий пароль
        fireEvent.change(newPasswordInput, { target: { value: '123' } });
        expect(screen.getByText('Пароль должен быть не менее 8 символов')).toBeInTheDocument();

        // Проверяем несовпадающие пароли
        fireEvent.change(newPasswordInput, { target: { value: '12345678' } });
        fireEvent.change(confirmPasswordInput, { target: { value: '87654321' } });
        expect(screen.getByText('Пароли не совпадают')).toBeInTheDocument();
    });

    it('должен успешно сбрасывать пароль при валидных данных', async () => {
        const { store } = renderWithRedux(<PasswordChange onResetPassword={mockOnResetPassword} />);

        // Подготавливаем форму
        const emailInput = screen.getByLabelText('Электронная почта');
        const codeInput = screen.getByLabelText('Код с почты');
        const newPasswordInput = screen.getByLabelText('Новый пароль');
        const confirmPasswordInput = screen.getByLabelText('Подтвердите пароль');

        // Заполняем все поля правильными данными
        fireEvent.change(emailInput, { target: { value: 'admin@ipu.ru' } });
        fireEvent.click(screen.getByText('Отправить код'));
        
        // Ждем отправки кода
        await waitFor(() => {
            const state = store.getState();
            expect(state.alertation.message).toBe('Код отправлен');
        });

        fireEvent.change(codeInput, { target: { value: '1234' } });
        
        // Ждем подтверждения кода
        await waitFor(() => {
            const state = store.getState();
            expect(state.alertation.message).toBe('Почта подтверждена');
        });

        // Вводим пароль и подтверждение
        fireEvent.change(newPasswordInput, { target: { value: '12345678' } });
        fireEvent.change(confirmPasswordInput, { target: { value: '12345678' } });

        // Получаем функцию сброса пароля из последнего вызова onResetPassword
        expect(mockOnResetPassword).toHaveBeenCalled();
        const resetPasswordFn = mockOnResetPassword.mock.calls[mockOnResetPassword.mock.calls.length - 1][0];
        
        // Вызываем функцию сброса пароля
        resetPasswordFn();

        // Проверяем успешное сообщение
        await waitFor(() => {
            const state = store.getState();
            expect(state.alertation.message).toBe('Пароль восстановлен');
            expect(state.alertation.severity).toBe('success');
        }, { timeout: 5000 });

        // Проверяем очистку полей
        await waitFor(() => {
            expect(emailInput).toHaveValue('');
            expect(codeInput).toHaveValue('');
            expect(newPasswordInput).toHaveValue('');
            expect(confirmPasswordInput).toHaveValue('');
        });
    });
}); 