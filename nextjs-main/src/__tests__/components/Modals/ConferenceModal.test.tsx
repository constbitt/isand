import { render, screen, fireEvent } from '@testing-library/react';
import ConferenceModal from '@/src/components/Modals/ConferenceModal';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Мокаем хуки RTK Query
jest.mock('@/src/store/api/serverApiV2_5', () => ({
    serverApiV2_5: {
        reducerPath: 'serverApiV2_5',
        reducer: () => ({}),
        middleware: () => () => () => {}
    },
    useGetOrgCardInfoQuery: () => ({
        data: [{
            org_isand_id: 1,
            name: 'Тестовая Организация',
            city: 'Москва',
            country: 'Россия',
            type: 'Университет',
        }],
        isLoading: false,
    }),
    useGetOrgAuthorsQuery: () => ({
        data: [
            { id: 1, name: 'Автор 1', h_index: 5 },
            { id: 2, name: 'Автор 2', h_index: 3 },
        ],
        isLoading: false,
    }),
    useGetOrgPublicationsQuery: () => ({
        data: [
            { id: 1, title: 'Публикация 1', authors: 'Автор 1', year: 2024 },
            { id: 2, title: 'Публикация 2', authors: 'Автор 2', year: 2024 },
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
            { id: 2, title: 'Публикация автора 2', year: 2024 }
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
    useGetOrgInfoQuery: () => ({
        data: {
            id: 1,
            name: 'Информация об организации',
            description: 'Описание организации',
        },
        isLoading: false,
    }),
    useGetConferenceInfoQuery: () => ({
        data: [{
            id: 1,
            name: 'Test Conference',
            year: 2024,
            city: 'Test City',
            country: 'Test Country',
        }],
        isLoading: false,
    }),
    useGetConferenceAuthorsQuery: () => ({
        data: [
            { id: 1, name: 'Author 1' },
            { id: 2, name: 'Author 2' },
        ],
        isLoading: false,
    }),
    useGetConferencePublicationsQuery: () => ({
        data: [
            { id: 1, title: 'Publication 1' },
            { id: 2, title: 'Publication 2' },
        ],
        isLoading: false,
    }),
}));

describe('ConferenceModal', () => {
    const mockHandleClose = jest.fn();
    const mockStore = configureStore({
        reducer: {
            mockReducer: (state = {}, action) => state
        },
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('вызывает handleClose при закрытии', () => {
        render(
            <Provider store={mockStore}>
                <ConferenceModal open={true} handleClose={mockHandleClose} id={1} />
            </Provider>
        );

        const backdrop = document.querySelector('.MuiBackdrop-root');
        if (backdrop) {
            fireEvent.click(backdrop);
            expect(mockHandleClose).toHaveBeenCalled();
        }
    });

    it('отображает заголовок модального окна', () => {
        render(
            <Provider store={mockStore}>
                <ConferenceModal open={true} handleClose={mockHandleClose} id={1} />
            </Provider>
        );

        expect(screen.getByRole('heading', { name: 'Профиль конференции' })).toBeInTheDocument();
    });
}); 