import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrganisationsTab from '@/src/components/Tabs/OrganisationsTab';
import { Provider } from 'react-redux';
import { createStore } from '@reduxjs/toolkit';
import { ReactElement } from 'react';

// Создаем простой мок store для тестов
const mockStore = {
  getState: () => ({
    serverApi: {
      queries: {},
      mutations: {},
      provided: {},
      subscriptions: {},
      config: {}
    }
  }),
  subscribe: jest.fn(),
  dispatch: jest.fn(),
};

const mockOrganisations = [
  {
    org_isand_id: 1,
    org_name: 'Тестовая Организация 1',
    avatar: 'test-avatar-1.jpg'
  },
  {
    org_isand_id: 2,
    org_name: 'Тестовая Организация 2',
    avatar: 'test-avatar-2.jpg'
  }
];

const renderWithProvider = (component: ReactElement) => {
  return render(
    <Provider store={mockStore as any}>
      {component}
    </Provider>
  );
};

// Мокаем модальное окно
jest.mock('@/src/components/Modals/OrganisationModal', () => {
  return {
    __esModule: true,
    default: ({ open }: { open: boolean }) => (open ? <div role="dialog">Modal Content</div> : null)
  };
});

describe('OrganisationsTab', () => {
  it('отображает загрузку при isLoading=true', () => {
    renderWithProvider(<OrganisationsTab organisations={[]} isLoading={true} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('отображает сообщение, когда нет организаций', () => {
    renderWithProvider(<OrganisationsTab organisations={[]} isLoading={false} />);
    expect(screen.getByText('Нет организаций для отображения.')).toBeInTheDocument();
  });

  it('отображает список организаций', () => {
    renderWithProvider(<OrganisationsTab organisations={mockOrganisations} isLoading={false} />);
    expect(screen.getByText('Тестовая Организация 1')).toBeInTheDocument();
    expect(screen.getByText('Тестовая Организация 2')).toBeInTheDocument();
  });

  it('открывает модальное окно при клике на организацию', () => {
    renderWithProvider(<OrganisationsTab organisations={mockOrganisations} isLoading={false} />);
    fireEvent.click(screen.getByText('Тестовая Организация 1'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
}); 