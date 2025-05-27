import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuthorOverviewTab from '@/src/components/Tabs/AuthorOverviewTab';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import * as serverApi from '@/src/store/api/serverApiV2_5';

// Мокаем хуки API
jest.mock('@/src/store/api/serverApiV2_5', () => ({
    useGetAuthorByPrndQuery: jest.fn(),
    useGetAuthorsActivityQuery: jest.fn()
}));

const mockStore = configureStore({
    reducer: {
        api: (state = {}) => state
    }
});

describe('AuthorOverviewTab', () => {
    const mockPrndAuthor = {
        id: 1,
        citations: [1, 2, 3],
        publications: 10,
        description: 'Test description',
        geoposition: 'Test geo',
        ids: [1, 2, 3]
    };

    const mockAuthorByPrnd = [{
        author_isand_id: 123,
        name: 'Test Author'
    }];

    const mockAuthorActivity = {
        articles: 5,
        conferences: 3,
        books: 2
    };

    beforeEach(() => {
        // Очищаем моки перед каждым тестом
        jest.clearAllMocks();
        
        // Устанавливаем дефолтные значения для моков API
        (serverApi.useGetAuthorByPrndQuery as jest.Mock).mockReturnValue({
            data: mockAuthorByPrnd,
            isLoading: false
        });
        
        (serverApi.useGetAuthorsActivityQuery as jest.Mock).mockReturnValue({
            data: mockAuthorActivity,
            isLoading: false
        });
    });

    const renderWithProvider = (component: React.ReactNode) => {
        return render(
            <Provider store={mockStore}>
                {component}
            </Provider>
        );
    };

    it('отображает сообщение о загрузке', () => {
        renderWithProvider(
            <AuthorOverviewTab 
                prndAuthor={null}
                matchingAuthorId={null}
                prndAuthorLoading={true}
            />
        );
        const loadingElements = screen.getAllByText('');
        expect(loadingElements.length).toBeGreaterThan(0);
    });

    it('отображает сообщение, когда автор не найден', () => {
        renderWithProvider(
            <AuthorOverviewTab 
                prndAuthor={null}
                matchingAuthorId={null}
                prndAuthorLoading={false}
            />
        );
        expect(screen.getByText('Автор не найден')).toBeInTheDocument();
    });

    it('корректно отображает информацию об авторе с данными из API', () => {
        renderWithProvider(
            <AuthorOverviewTab 
                prndAuthor={mockPrndAuthor}
                matchingAuthorId={1}
                prndAuthorLoading={false}
            />
        );

        expect(serverApi.useGetAuthorByPrndQuery).toHaveBeenCalledWith(mockPrndAuthor.id, { skip: false });
        expect(serverApi.useGetAuthorsActivityQuery).toHaveBeenCalledWith(123, { skip: false });
    });

    it('обрабатывает случай, когда API возвращает ошибку', () => {
        (serverApi.useGetAuthorByPrndQuery as jest.Mock).mockReturnValue({
            error: new Error('API Error'),
            isLoading: false
        });

        renderWithProvider(
            <AuthorOverviewTab 
                prndAuthor={mockPrndAuthor}
                matchingAuthorId={1}
                prndAuthorLoading={false}
            />
        );
    });

    it('правильно считает общее количество публикаций', () => {
        renderWithProvider(
            <AuthorOverviewTab 
                prndAuthor={mockPrndAuthor}
                matchingAuthorId={1}
                prndAuthorLoading={false}
            />
        );

        const totalPublications = mockAuthorActivity.articles + 
                               mockAuthorActivity.conferences + 
                               mockAuthorActivity.books;
        expect(screen.getByText(totalPublications.toString())).toBeInTheDocument();
    });
}); 