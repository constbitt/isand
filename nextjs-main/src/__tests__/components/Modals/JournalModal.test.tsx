import { render, screen, fireEvent, within } from '@testing-library/react';
import JournalModal from '@/src/components/Modals/JournalModal';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Мокаем хуки RTK Query
jest.mock('@/src/store/api/serverApiV2_5', () => ({
    useGetJournalInfoQuery: () => ({
        data: [{
            journal_isand_id: 1,
            name: 'Test Journal',
            year: 2024,
            publisher: 'Test Publisher',
        }],
        isLoading: false,
    }),
    useGetJournalAuthorsQuery: () => ({
        data: [
            { id: 1, name: 'Author 1' },
            { id: 2, name: 'Author 2' },
        ],
        isLoading: false,
    }),
    useGetJournalPublicationsQuery: () => ({
        data: [
            { id: 1, title: 'Publication 1', authors: 'Author 1', year: 2024 },
            { id: 2, title: 'Publication 2', authors: 'Author 2', year: 2024 },
        ],
        isLoading: false,
    }),
}));

describe('JournalModal', () => {
    const mockHandleClose = jest.fn();
    const mockStore = configureStore({
        reducer: {
            mockReducer: (state = {}, action) => state
        },
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('отображает заголовок модального окна', () => {
        render(
            <Provider store={mockStore}>
                <JournalModal open={true} handleClose={mockHandleClose} id={1} />
            </Provider>
        );

        const titleElement = document.querySelector('title');
        expect(titleElement?.textContent).toBe('Профиль журнала');
    });

    it('вызывает handleClose при закрытии', () => {
        render(
            <Provider store={mockStore}>
                <JournalModal open={true} handleClose={mockHandleClose} id={1} />
            </Provider>
        );

        const backdrop = document.querySelector('.MuiBackdrop-root');
        if (backdrop) {
            fireEvent.click(backdrop);
            expect(mockHandleClose).toHaveBeenCalled();
        }
    });

    it('отображает вкладки и переключается между ними', () => {
        render(
            <Provider store={mockStore}>
                <JournalModal open={true} handleClose={mockHandleClose} id={1} />
            </Provider>
        );

        // Проверяем наличие всех вкладок
        const tabList = screen.getByRole('tablist');
        expect(within(tabList).getByText('Обзор')).toBeInTheDocument();
        expect(within(tabList).getByText('Публикации')).toBeInTheDocument();
        expect(within(tabList).getByText('Авторы')).toBeInTheDocument();

        // Проверяем информацию на вкладке обзора
        const overviewTab = screen.getByRole('tabpanel');
        const overviewElements = within(overviewTab).getAllByText(/Количество/);
        expect(overviewElements[0]).toHaveTextContent('Количество авторов: 2');
        expect(overviewElements[1]).toHaveTextContent('Количество публикаций: 2');

        // Проверяем переключение на вкладку публикаций
        fireEvent.click(screen.getByRole('tab', { name: 'Публикации' }));
        const publicationsTab = screen.getByRole('tabpanel');
        const publicationElements = within(publicationsTab).getAllByText(/Авторы:/);
        expect(publicationElements[0]).toBeInTheDocument();
        const yearElements = within(publicationsTab).getAllByText(/Год:/);
        expect(yearElements[0]).toBeInTheDocument();
    });

    it('отображает сообщение о загрузке', () => {
        // Переопределяем мок для тестирования состояния загрузки
        jest.spyOn(require('@/src/store/api/serverApiV2_5'), 'useGetJournalInfoQuery')
            .mockImplementation(() => ({
                data: null,
                isLoading: true,
            }));

        render(
            <Provider store={mockStore}>
                <JournalModal open={true} handleClose={mockHandleClose} id={1} />
            </Provider>
        );

        expect(screen.getByText('Загрузка информации о журнале...')).toBeInTheDocument();
    });
}); 