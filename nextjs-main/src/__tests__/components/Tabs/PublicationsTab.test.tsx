import { render, screen, fireEvent, within } from '@testing-library/react';
import PublicationsTab from '@/src/components/Tabs/PublicationsTab';

// Мок для PublicationModal
jest.mock('@/src/components/Modals/PublicationModal', () => {
    return function DummyModal({ 
        open, 
        handleClose, 
        id, 
        isIsandId 
    }: { 
        open: boolean; 
        handleClose: () => void; 
        id: number; 
        isIsandId: boolean; 
    }) {
        return open ? (
            <div data-testid="publication-modal">
                <button onClick={handleClose} data-testid="close-modal-button">
                    Закрыть
                </button>
                Modal content {id}
            </div>
        ) : null;
    };
});

describe('PublicationsTab', () => {
    const mockPublications = [
        {
            publ_isand_id: 1,
            publ_name: 'Тестовая публикация 1',
            author_fios: 'Иванов И.И.',
            year: '2023'
        },
        {
            publ_isand_id: 2,
            publ_name: 'Тестовая публикация 2',
            author_fios: 'Петров П.П.',
            year: '2022'
        }
    ];

    it('отображает загрузку при isLoading=true', () => {
        render(<PublicationsTab publications={[]} isLoading={true} />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('отображает сообщение, когда нет публикаций', () => {
        render(<PublicationsTab publications={[]} isLoading={false} />);
        expect(screen.getByText('Нет публикаций для отображения.')).toBeInTheDocument();
    });

    it('корректно отображает список публикаций', () => {
        render(<PublicationsTab publications={mockPublications} isLoading={false} />);
        
        const cards = screen.getAllByRole('article');
        expect(cards).toHaveLength(2);

        // Проверяем первую карточку
        const firstCard = cards[0];
        expect(within(firstCard).getByText('Тестовая публикация 1')).toBeInTheDocument();
        expect(within(firstCard).getByText(/Авторы:/)).toBeInTheDocument();
        expect(within(firstCard).getByText(/Иванов И./)).toBeInTheDocument();
        expect(within(firstCard).getByText(/Год: 2023/)).toBeInTheDocument();

        // Проверяем вторую карточку
        const secondCard = cards[1];
        expect(within(secondCard).getByText('Тестовая публикация 2')).toBeInTheDocument();
        expect(within(secondCard).getByText(/Авторы:/)).toBeInTheDocument();
        expect(within(secondCard).getByText(/Петров П./)).toBeInTheDocument();
        expect(within(secondCard).getByText(/Год: 2022/)).toBeInTheDocument();
    });

    it('открывает модальное окно при клике на публикацию', () => {
        render(<PublicationsTab publications={mockPublications} isLoading={false} />);
        
        fireEvent.click(screen.getByText('Тестовая публикация 1'));
        expect(screen.getByTestId('publication-modal')).toBeInTheDocument();
    });

    it('закрывает модальное окно при клике на кнопку закрытия', () => {
        render(<PublicationsTab publications={mockPublications} isLoading={false} />);
        
        // Открываем модальное окно
        fireEvent.click(screen.getByText('Тестовая публикация 1'));
        expect(screen.getByTestId('publication-modal')).toBeInTheDocument();
        
        // Закрываем модальное окно через кнопку
        fireEvent.click(screen.getByTestId('close-modal-button'));
        expect(screen.queryByTestId('publication-modal')).not.toBeInTheDocument();
    });
}); 