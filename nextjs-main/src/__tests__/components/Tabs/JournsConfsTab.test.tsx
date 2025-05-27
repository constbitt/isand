import { render, screen, fireEvent, act } from '@testing-library/react';
import JournsConfsTab from '@/src/components/Tabs/JournsConfsTab';
import { renderWithProviders } from '@/src/__tests__/test-utils';

const mockJournals = [
  {
    journal_isand_id: 1,
    journal_name: 'Тестовый журнал 1',
    avatar: 'test-avatar-1.jpg'
  },
  {
    journal_isand_id: 2,
    journal_name: 'Тестовый журнал 2',
    avatar: 'test-avatar-2.jpg'
  }
];

const mockConferences = [
  {
    conf_isand_id: 1,
    conf_name: 'Тестовая конференция 1',
    avatar: 'test-conf-avatar-1.jpg'
  },
  {
    conf_isand_id: 2,
    conf_name: 'Тестовая конференция 2',
    avatar: 'test-conf-avatar-2.jpg'
  }
];

describe('JournsConfsTab', () => {
  it('отображает загрузку при isLoading=true', () => {
    renderWithProviders(<JournsConfsTab journals={[]} conferences={[]} isLoading={true} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('отображает сообщение, когда нет журналов', () => {
    renderWithProviders(<JournsConfsTab journals={[]} conferences={[]} isLoading={false} />);
    expect(screen.getByText('Журналы не найдены')).toBeInTheDocument();
  });

  it('отображает сообщение, когда нет конференций', () => {
    renderWithProviders(<JournsConfsTab journals={[]} conferences={[]} isLoading={false} />);
    expect(screen.getByText('Конференции не найдены')).toBeInTheDocument();
  });

  it('отображает список журналов', () => {
    renderWithProviders(<JournsConfsTab journals={mockJournals} conferences={[]} isLoading={false} />);
    expect(screen.getByText('Тестовый журнал 1')).toBeInTheDocument();
    expect(screen.getByText('Тестовый журнал 2')).toBeInTheDocument();
  });

  it('отображает список конференций', () => {
    renderWithProviders(<JournsConfsTab journals={[]} conferences={mockConferences} isLoading={false} />);
    expect(screen.getByText('Тестовая конференция 1')).toBeInTheDocument();
    expect(screen.getByText('Тестовая конференция 2')).toBeInTheDocument();
  });

  it('открывает модальное окно журнала при клике', async () => {
    renderWithProviders(<JournsConfsTab journals={mockJournals} conferences={[]} isLoading={false} />);
    await act(async () => {
      fireEvent.click(screen.getByText('Тестовый журнал 1'));
    });
    expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
  });

  it('открывает модальное окно конференции при клике', async () => {
    renderWithProviders(<JournsConfsTab journals={[]} conferences={mockConferences} isLoading={false} />);
    await act(async () => {
      fireEvent.click(screen.getByText('Тестовая конференция 1'));
    });
    expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
  });
}); 