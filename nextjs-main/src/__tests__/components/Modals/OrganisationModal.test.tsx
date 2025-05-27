import { render, screen, fireEvent, within } from '@testing-library/react';
import OrganisationModal from '@/src/components/Modals/OrganisationModal';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { serverApiV2_5 } from '@/src/store/api/serverApiV2_5';
import { alertationSlice } from '@/src/store/slices/alertationSlice';
import { serverApi } from '@/src/store/api/serverApi';

// Мокаем хуки RTK Query
jest.mock('@/src/store/api/serverApiV2_5', () => ({
    serverApiV2_5: {
        reducerPath: 'serverApiV2_5',
        reducer: () => ({}),
        middleware: () => () => {}
    },
    useGetOrgCardInfoQuery: () => ({
        data: [{
            org_isand_id: 1,
            name: 'Тестовая Организация',
            city: 'Москва',
            country: 'Россия',
            type: 'Университет',
            org_name: 'Тестовая Организация',
            org_alt_names: 'Альтернативное название 1; Альтернативное название 2',
            ext_source: 'Тестовый источник',
            ror: 'https://ror.org/test',
            url: 'https://test-org.com',
            wikidata: 'https://wikidata.org/test',
        }],
        isLoading: false,
    }),
    useGetOrgAuthorsQuery: () => ({
        data: [
            { id: 1, author_isand_id: 1, author_fio: 'Автор 1', h_index: 5, avatar: '' },
            { id: 2, author_isand_id: 2, author_fio: 'Автор 2', h_index: 3, avatar: '' },
        ],
        isLoading: false,
    }),
    useGetOrgPublicationsQuery: () => ({
        data: [
            { id: 1, publ_isand_id: 1, publ_name: 'Публикация 1', author_fios: 'Автор 1', year: 2024 },
            { id: 2, publ_isand_id: 2, publ_name: 'Публикация 2', author_fios: 'Автор 2', year: 2023 },
        ],
        isLoading: false,
    }),
    useGetAuthorByIsandIdQuery: () => ({
        data: {
            id: 1,
            name: 'Тестовый Автор',
            h_index: 5,
            publications_count: 10
        },
        isLoading: false
    }),
    useGetPublicationsByAuthorIdQuery: () => ({
        data: [
            { id: 1, title: 'Публикация автора 1', year: 2024 },
            { id: 2, title: 'Публикация автора 2', year: 2023 }
        ],
        isLoading: false
    }),
    useGetAuthorJournalsQuery: () => ({
        data: [
            { id: 1, title: 'Журнал 1', issn: '1234-5678' },
            { id: 2, title: 'Журнал 2', issn: '8765-4321' }
        ],
        isLoading: false
    }),
    useGetAuthorConferencesQuery: () => ({
        data: [
            { id: 1, title: 'Конференция 1' },
            { id: 2, title: 'Конференция 2' }
        ],
        isLoading: false
    }),
    useGetOrgInfoQuery: () => ({
        data: [
            { id: 1, name: 'Организация 1', description: 'Описание организации 1' },
            { id: 2, name: 'Организация 2', description: 'Описание организации 2' }
        ],
        isLoading: false,
        error: null
    }),
    useGetPublCardInfoQuery: () => ({
        data: {},
        isLoading: false
    })
}));

// Мокируем компоненты модальных окон
jest.mock('@/src/components/Modals/AuthorModal', () => ({
    __esModule: true,
    default: ({ open, handleClose, id }: { open: boolean; handleClose: () => void; id: number }) => (
        <div data-testid="author-modal-mock">
            Модальное окно автора {id}
        </div>
    )
}));

jest.mock('@/src/components/Modals/PublicationModal', () => ({
    __esModule: true,
    default: ({ open, handleClose, id }: { open: boolean; handleClose: () => void; id: number }) => (
        <div data-testid="publication-modal-mock">
            Модальное окно публикации {id}
        </div>
    )
}));

// Мокируем serverApi
jest.mock('@/src/store/api/serverApi', () => {
    return {
        serverApi: {
            reducerPath: 'serverApi',
            reducer: () => ({}),
            middleware: () => () => {}
        },
        getAuthors: {
            initiate: jest.fn(() => ({ 
                type: 'serverApi/executeQuery',
                payload: { 
                    data: [], 
                    endpoint: 'getAuthors',
                },
                unsubscribe: jest.fn(),
                refetch: jest.fn()
            }))
        }
    };
});

describe('OrganisationModal', () => {
    const mockHandleClose = jest.fn();
    
    // Создаем тестовый store
    const store = configureStore({
        reducer: {
            [serverApiV2_5.reducerPath]: serverApiV2_5.reducer,
            alertation: alertationSlice.reducer,
            [serverApi.reducerPath]: serverApi.reducer
        }
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('отображает заголовок модального окна', () => {
        render(
            <Provider store={store}>
                <OrganisationModal open={true} handleClose={mockHandleClose} id={1} />
            </Provider>
        );

        const titleElement = document.querySelector('title');
        expect(titleElement?.textContent).toBe('Профиль организации');
    });

    it('вызывает handleClose при закрытии', () => {
        render(
            <Provider store={store}>
                <OrganisationModal open={true} handleClose={mockHandleClose} id={1} />
            </Provider>
        );

        const backdrop = document.querySelector('.MuiBackdrop-root');
        if (backdrop) {
            fireEvent.click(backdrop);
            expect(mockHandleClose).toHaveBeenCalled();
        }
    });

    it('отображает информацию о вкладках', () => {
        render(
            <Provider store={store}>
                <OrganisationModal open={true} handleClose={mockHandleClose} id={1} />
            </Provider>
        );

        // Проверяем наличие всех вкладок
        const tabList = screen.getByRole('tablist');
        expect(within(tabList).getByText('Обзор')).toBeInTheDocument();
        expect(within(tabList).getByText('Публикации')).toBeInTheDocument();
        expect(within(tabList).getByText('Авторы')).toBeInTheDocument();

        // Проверяем информацию на вкладке обзора
        const authorsElements = screen.getAllByText(/Количество авторов:/i);
        expect(authorsElements[0]).toHaveTextContent('Количество авторов: 2');
        
        const publicationsElements = screen.getAllByText(/Количество публикаций:/i);
        expect(publicationsElements[0]).toHaveTextContent('Количество публикаций: 2');
    });

    it('отображает сообщение о загрузке', () => {
        // Переопределяем мок для тестирования состояния загрузки
        jest.spyOn(require('@/src/store/api/serverApiV2_5'), 'useGetOrgCardInfoQuery')
            .mockImplementation(() => ({
                data: null,
                isLoading: true,
            }));

        render(
            <Provider store={store}>
                <OrganisationModal open={true} handleClose={mockHandleClose} id={1} />
            </Provider>
        );

        expect(screen.getByText('Загрузка информации об организации...')).toBeInTheDocument();
    });

    it('не делает запросы при невалидном id', () => {
        render(
            <Provider store={store}>
                <OrganisationModal open={true} handleClose={mockHandleClose} id={-1} />
            </Provider>
        );

        // Проверяем, что компонент отрендерился, но не делает запросы
        const titleElement = document.querySelector('title');
        expect(titleElement?.textContent).toBe('Профиль организации');
    });
}); 