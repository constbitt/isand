import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import PublicationModal from '@/src/components/Modals/PublicationModal';

// Мок для API хуков
const mockPublCardInfo = [{
    publ_name: 'Тестовая публикация',
    annotation: 'Тестовая аннотация',
    publ_type: 'Статья',
    collect_type: 'Журнал',
    collect_name: 'Тестовый журнал'
}];

jest.mock('@/src/store/api/serverApiV2_5', () => ({
    useGetPublInfoQuery: () => ({ data: [], isLoading: false }),
    useGetPublIsandInfoQuery: () => ({ data: [], isLoading: false }),
    useGetPublCardInfoQuery: () => ({ data: mockPublCardInfo }),
    serverApiV2_5: {
        reducer: () => ({}),
        middleware: () => () => () => {},
    }
}));

jest.mock('@/src/store/api/serverApiFW', () => ({
    useGetPrndDataQuery: () => ({ data: [] }),
    serverApiFW: {
        reducer: () => ({}),
        middleware: () => () => () => {},
    }
}));

// Мок для store
const store = configureStore({
    reducer: {},
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

describe('PublicationModal', () => {
    const defaultProps = {
        open: true,
        handleClose: jest.fn(),
        id: 1,
        isIsandId: false,
    };

    const renderComponent = (props = defaultProps) => {
        return render(
            <Provider store={store}>
                <PublicationModal {...props} />
            </Provider>
        );
    };

    it('отображает модальное окно, когда open=true', () => {
        renderComponent();
        expect(screen.getByText('Тестовая публикация')).toBeInTheDocument();
    });

    it('вызывает handleClose при закрытии модального окна', () => {
        renderComponent();
        const modal = screen.getByRole('presentation');
        fireEvent.click(modal.firstChild as Element);
        expect(defaultProps.handleClose).toHaveBeenCalled();
    });

    it('отображает табы с правильными заголовками', () => {
        renderComponent();
        expect(screen.getByText('Обзор')).toBeInTheDocument();
        expect(screen.getByText('Авторы')).toBeInTheDocument();
    });

    it('отображает информацию о публикации в табе Обзор', () => {
        renderComponent();
        expect(screen.getByText('Тестовая аннотация')).toBeInTheDocument();
    });
}); 