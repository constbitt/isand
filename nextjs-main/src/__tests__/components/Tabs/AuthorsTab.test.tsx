import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuthorsTab from '@/src/components/Tabs/AuthorsTab';

// Мок для StyledAvatar
jest.mock('@/src/components/Avatar/StyledAvatar', () => {
    return function DummyStyledAvatar({ fio }: { fio: string }) {
        return <div data-testid="styled-avatar">{fio}</div>;
    };
});

// Мок для AuthorModal
jest.mock('@/src/components/Modals/AuthorModal', () => {
    return function DummyAuthorModal({ open, handleClose }: { open: boolean; handleClose: () => void }) {
        return open ? (
            <div data-testid="author-modal">
                <button onClick={handleClose}>Закрыть</button>
            </div>
        ) : null;
    };
});

const mockAuthors = [
    {
        author_isand_id: 1,
        author_fio: 'Иванов Иван',
        avatar: 'path/to/avatar1.jpg'
    },
    {
        author_isand_id: 2,
        author_fio: 'Петров Петр',
        avatar: null
    }
];

describe('AuthorsTab', () => {
    it('отображает индикатор загрузки', () => {
        render(<AuthorsTab authors={[]} isLoading={true} />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('отображает сообщение при отсутствии авторов', () => {
        render(<AuthorsTab authors={[]} isLoading={false} />);
        expect(screen.getByText('Нет авторов для отображения.')).toBeInTheDocument();
    });

    it('отображает список авторов', () => {
        render(<AuthorsTab authors={mockAuthors} isLoading={false} />);
        const authorNames = screen.getAllByRole('heading', { level: 6 });
        expect(authorNames[0]).toHaveTextContent('Иванов Иван');
        expect(authorNames[1]).toHaveTextContent('Петров Петр');
    });

    it('открывает модальное окно при клике на карточку автора', () => {
        render(<AuthorsTab authors={mockAuthors} isLoading={false} />);
        const authorCard = screen.getAllByRole('heading', { level: 6 })[0].closest('.MuiCard-root');
        fireEvent.click(authorCard!);
        expect(screen.getByTestId('author-modal')).toBeInTheDocument();
    });

    it('закрывает модальное окно', () => {
        render(<AuthorsTab authors={mockAuthors} isLoading={false} />);
        const authorCard = screen.getAllByRole('heading', { level: 6 })[0].closest('.MuiCard-root');
        fireEvent.click(authorCard!);
        fireEvent.click(screen.getByText('Закрыть'));
        expect(screen.queryByTestId('author-modal')).not.toBeInTheDocument();
    });

    it('отображает аватары для авторов', () => {
        render(<AuthorsTab authors={mockAuthors} isLoading={false} />);
        const avatars = screen.getAllByTestId('styled-avatar');
        expect(avatars).toHaveLength(2);
    });
}); 