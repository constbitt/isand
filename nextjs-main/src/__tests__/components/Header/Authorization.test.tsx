import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AuthorizationComponent from '@/src/components/Header/Authorization';
import { headerModalSlice } from '@/src/store/slices/headerModalSlice';
import { useRouter } from 'next/router';

// Мок для next/router
jest.mock('next/router', () => ({
    useRouter: () => ({
        push: mockPush
    })
}));

const mockPush = jest.fn();
const mockOnKeyDown = jest.fn();
const mockOnForgotPassword = jest.fn();

const initialState = {
    headerModal: {
        pass_error: false,
        auth_email: '',
        auth_password: '',
        lastname: '',
        name: '',
        patronymic: '',
        affiliation: '',
        reg_email: '',
        reg_password: '',
        reg_confirm_password: '',
        none_last_name: false,
        none_name: false,
        none_patronymic: false,
        none_affiliation: false,
        none_email: false,
        none_password: false,
        none_confirm_password: false,
        pass_match_error: false,
        len_error: false,
        confirm_error: false,
        exist_email_error: false,
        header_avatar_url: '',
        header_fio: '',
        authorization: false
    }
};

const renderComponent = () => {
    const store = configureStore({
        reducer: {
            headerModal: headerModalSlice.reducer,
        },
        preloadedState: initialState
    });

    return render(
        <Provider store={store}>
            <AuthorizationComponent onKeyDown={mockOnKeyDown} onForgotPassword={mockOnForgotPassword} />
        </Provider>
    );
};

describe('AuthorizationComponent', () => {
    beforeEach(() => {
        mockPush.mockClear();
        mockOnKeyDown.mockClear();
        mockOnForgotPassword.mockClear();
    });

    it('должен отображать поля для email и пароля', () => {
        renderComponent();
        expect(screen.getByLabelText('Электронная почта')).toBeInTheDocument();
        expect(screen.getByLabelText('Пароль')).toBeInTheDocument();
    });

    it('должен показывать ошибку при неверных учетных данных', () => {
        renderComponent();
        const emailInput = screen.getByLabelText('Электронная почта');
        const passwordInput = screen.getByLabelText('Пароль');

        fireEvent.change(emailInput, { target: { value: 'wrong@email.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
        fireEvent.keyDown(passwordInput, { key: 'Enter' });

        const errorMessages = screen.getAllByText('Не верный логин или пароль');
        expect(errorMessages).toHaveLength(2);
    });

    it('должен успешно авторизовать с правильными учетными данными', () => {
        renderComponent();
        const emailInput = screen.getByLabelText('Электронная почта');
        const passwordInput = screen.getByLabelText('Пароль');

        fireEvent.change(emailInput, { target: { value: 'admin@ipu.ru' } });
        fireEvent.change(passwordInput, { target: { value: '12345678' } });
        fireEvent.keyDown(passwordInput, { key: 'Enter' });

        expect(mockPush).toHaveBeenCalledWith('/account');
        expect(mockOnKeyDown).toHaveBeenCalled();
    });

    it('должен вызывать обработчик "Забыли пароль"', () => {
        renderComponent();
        fireEvent.click(screen.getByText('Забыли пароль?'));
        expect(mockOnForgotPassword).toHaveBeenCalled();
    });
}); 