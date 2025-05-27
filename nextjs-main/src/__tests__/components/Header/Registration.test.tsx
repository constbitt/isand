import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import RegistrationComponent from '@/src/components/Header/Registration';
import { headerModalSlice } from '@/src/store/slices/headerModalSlice';
import { useRouter } from 'next/router';
import { useGetAccountApiAffiliationQuery } from '@/src/store/api/serverApiV4';

// Мок для next/router
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

// Мок для API запроса аффилиаций
jest.mock('@/src/store/api/serverApiV4', () => ({
    useGetAccountApiAffiliationQuery: jest.fn(),
}));

describe('RegistrationComponent', () => {
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
            len_error: false,
            confirm_error: false,
            exist_email_error: false,
            none_email: false,
            none_last_name: false,
            none_name: false,
            none_password: false,
            header_avatar_url: '',
            header_fio: '',
            authorization: false
        }
    };

    const mockStore = configureStore({
        reducer: {
            headerModal: headerModalSlice.reducer,
        },
        preloadedState: initialState
    });

    const mockOnKeyDown = jest.fn();
    const mockPush = jest.fn();
    const mockAffiliations = ['ИПУ РАН', 'МГУ', 'МФТИ'];

    beforeEach(() => {
        (useRouter as jest.Mock).mockImplementation(() => ({
            push: mockPush,
        }));
        (useGetAccountApiAffiliationQuery as jest.Mock).mockReturnValue({
            data: mockAffiliations,
            isLoading: false,
            error: null,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('должен отображать все необходимые поля формы', () => {
        render(
            <Provider store={mockStore}>
                <RegistrationComponent onKeyDown={mockOnKeyDown} />
            </Provider>
        );

        expect(screen.getByLabelText('Фамилия')).toBeInTheDocument();
        expect(screen.getByLabelText('Имя')).toBeInTheDocument();
        expect(screen.getByLabelText('Отчество (необязательно)')).toBeInTheDocument();
        expect(screen.getByLabelText('Электронная почта')).toBeInTheDocument();
        expect(screen.getByLabelText('Пароль')).toBeInTheDocument();
        expect(screen.getByLabelText('Пароль (повторно)')).toBeInTheDocument();
    });

    it('должен показывать ошибки при пустых обязательных полях', async () => {
        render(
            <Provider store={mockStore}>
                <RegistrationComponent onKeyDown={mockOnKeyDown} />
            </Provider>
        );

        const passwordInput = screen.getByLabelText('Пароль (повторно)');
        fireEvent.keyDown(passwordInput, { key: 'Enter' });

        // Ждем появления сообщений об ошибках
        const errorMessages = await Promise.all([
            screen.findByText('Фамилия не может быть пустой'),
            screen.findByText('Имя не может быть пустым'),
            screen.findByText('Email не может быть пустым'),
            screen.findByText('Пароль не может быть пустым')
        ]);

        errorMessages.forEach(message => {
            expect(message).toBeInTheDocument();
        });
    });

    it('должен показывать ошибку при несовпадающих паролях', () => {
        render(
            <Provider store={mockStore}>
                <RegistrationComponent onKeyDown={mockOnKeyDown} />
            </Provider>
        );

        const passwordInput = screen.getByLabelText('Пароль');
        const confirmPasswordInput = screen.getByLabelText('Пароль (повторно)');

        fireEvent.change(passwordInput, { target: { value: '12345678' } });
        fireEvent.change(confirmPasswordInput, { target: { value: '87654321' } });

        expect(screen.getByText('Пароли не совпадают')).toBeInTheDocument();
    });

    it('должен успешно регистрировать с правильными данными', async () => {
        render(
            <Provider store={mockStore}>
                <RegistrationComponent onKeyDown={mockOnKeyDown} />
            </Provider>
        );

        // Заполняем все поля
        fireEvent.change(screen.getByLabelText('Фамилия'), { target: { value: 'Иванов' } });
        fireEvent.change(screen.getByLabelText('Имя'), { target: { value: 'Иван' } });
        fireEvent.change(screen.getByLabelText('Электронная почта'), { target: { value: 'admin@ipu.ru' } });
        fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: '12345678' } });
        fireEvent.change(screen.getByLabelText('Пароль (повторно)'), { target: { value: '12345678' } });

        // Имитируем нажатие Enter
        fireEvent.keyDown(screen.getByLabelText('Пароль (повторно)'), { key: 'Enter' });

        // Ждем вызова функций
        await expect(mockPush).toHaveBeenCalledWith('/account');
        expect(mockOnKeyDown).toHaveBeenCalled();
    });
}); 