import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthorModal from '@/src/components/Modals/AuthorModal';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Мокируем API
const mockUseGetAuthorInfoQuery = jest.fn();
const mockUseGetAuthorByIsandIdQuery = jest.fn();
const mockUseGetPublicationsByAuthorIdQuery = jest.fn();
const mockUseGetOrgInfoQuery = jest.fn();
const mockUseGetAuthorJournalsQuery = jest.fn();
const mockUseGetAuthorConferencesQuery = jest.fn();
const mockGetAuthors = jest.fn();
const mockInView = jest.fn();
const mockRef = jest.fn();

// Настраиваем таймеры Jest
jest.useFakeTimers();

jest.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: mockRef, inView: mockInView() })
}));

jest.mock('@/src/store/api/serverApiV2_5', () => ({
  useGetAuthorByIsandIdQuery: (...args: any[]) => mockUseGetAuthorByIsandIdQuery(...args),
  useGetPublicationsByAuthorIdQuery: (...args: any[]) => mockUseGetPublicationsByAuthorIdQuery(...args),
  useGetOrgInfoQuery: (...args: any[]) => mockUseGetOrgInfoQuery(...args),
  useGetAuthorJournalsQuery: (...args: any[]) => mockUseGetAuthorJournalsQuery(...args),
  useGetAuthorConferencesQuery: (...args: any[]) => mockUseGetAuthorConferencesQuery(...args)
}));

jest.mock('@/src/store/api/serverApiV3', () => ({
  useGetAuthorInfoQuery: (...args: any[]) => mockUseGetAuthorInfoQuery(...args)
}));

jest.mock('@/src/store/api/serverApi', () => ({
  getAuthors: {
    initiate: () => mockGetAuthors
  }
}));

// Мокируем компоненты
jest.mock('@/src/components/Cards/AuthorPersonHat', () => {
  return function MockAuthorPersonHat({ author }: { author: { a_fio: string, a_aff_org_name: string, avatar: string } }) {
    return <div data-testid="author-hat">{author.a_fio}</div>;
  };
});

jest.mock('@/src/components/Tabs/AuthorOverviewTab', () => {
  return function MockAuthorOverviewTab({ prndAuthor }: any) {
    return <div data-testid="overview-tab">{prndAuthor?.h_index}</div>;
  };
});

jest.mock('@/src/components/Tabs/PublicationsTab', () => {
  return function MockPublicationsTab({ publications }: any) {
    return <div data-testid="publications-tab">{publications[0]?.title}</div>;
  };
});

jest.mock('@/src/components/Tabs/OrganisationsTab', () => {
  return function MockOrganisationsTab({ organisations }: any) {
    return <div data-testid="organisations-tab">{organisations[0]?.name}</div>;
  };
});

jest.mock('@/src/components/Tabs/JournsConfsTab', () => {
  return function MockJournsConfsTab() {
    return <div data-testid="journsconfs-tab">Журналы и конференции</div>;
  };
});

jest.mock('@/src/components/Tabs/TabsComponent', () => {
  return function MockTabsComponent({ tabs, onChange, propsValue }: any) {
    return (
      <div data-testid="tabs-component">
        {tabs.map((tab: any, index: number) => (
          <button
            key={tab.label}
            onClick={() => onChange(index)}
            data-testid={`tab-${index}`}
            data-selected={index === propsValue}
          >
            {tab.label}
          </button>
        ))}
        {tabs[propsValue].component}
      </div>
    );
  };
});

// Базовые моки данных
const mockAuthor = [{
  author_fio: 'Test Author',
  org_names: 'Test Organization',
  org_isand_ids: '1,2,3',
  avatar: 'test-avatar.jpg'
}];

const mockPublications = [{
  id: '1',
  title: 'Test Publication',
  year: 2023,
  authors: ['Test Author'],
  journal: 'Test Journal'
}];

const mockOrganizations = [{
  id: 1,
  name: 'Test Organization'
}];

const mockPrndAuthor = {
  id: '1',
  value: 'Test Author',
  h_index: 5,
  publications: [],
  citations: []
};

const mockReducer = (state = {}, action: any) => state;

const store = configureStore({
  reducer: {
    mock: mockReducer
  }
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
  mockInView.mockReturnValue(false);
  
  mockUseGetAuthorByIsandIdQuery.mockReturnValue({
    data: mockAuthor,
    isLoading: false,
    error: null
  });
  
  mockUseGetPublicationsByAuthorIdQuery.mockReturnValue({
    data: mockPublications,
    isLoading: false
  });
  
  mockUseGetOrgInfoQuery.mockReturnValue({
    data: mockOrganizations,
    isLoading: false
  });

  mockUseGetAuthorJournalsQuery.mockReturnValue({
    data: [],
    isLoading: false
  });

  mockUseGetAuthorConferencesQuery.mockReturnValue({
    data: [],
    isLoading: false
  });

  mockGetAuthors.mockResolvedValue({
    data: [mockPrndAuthor]
  });

  mockUseGetAuthorInfoQuery.mockReturnValue({
    data: mockPrndAuthor,
    isLoading: false
  });
});

afterEach(() => {
  jest.clearAllTimers();
});

const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <Provider store={store}>
      {ui}
    </Provider>
  );
};

describe('AuthorModal', () => {
  const handleClose = jest.fn();

  it('отображает информацию об авторе', async () => {
    renderWithProvider(<AuthorModal open={true} handleClose={handleClose} id={1} />);
    await waitFor(() => {
      expect(screen.getByTestId('author-hat')).toBeInTheDocument();
    });
  });

  it('загружает и отображает данные prndAuthor', async () => {
    renderWithProvider(<AuthorModal open={true} handleClose={handleClose} id={1} />);
    await waitFor(() => {
      expect(screen.getByTestId('overview-tab')).toHaveTextContent('5');
    });
  });

  it('загружает организации при прокрутке', async () => {
    mockInView.mockReturnValue(true);
    renderWithProvider(<AuthorModal open={true} handleClose={handleClose} id={1} />);
    await waitFor(() => {
      expect(mockUseGetOrgInfoQuery).toHaveBeenCalled();
    });
  });

  it('переключается между вкладками', async () => {
    renderWithProvider(<AuthorModal open={true} handleClose={handleClose} id={1} />);
    await waitFor(() => {
      const publicationsTab = screen.getByText('Публикации');
      const organisationsTab = screen.getByText('Организации');
      const journalsTab = screen.getByText('Журналы и конференции');
      
      fireEvent.click(organisationsTab);
      expect(screen.getByTestId('organisations-tab')).toBeInTheDocument();
      
      fireEvent.click(publicationsTab);
      expect(screen.getByTestId('publications-tab')).toBeInTheDocument();
      
      fireEvent.click(journalsTab);
      expect(screen.getByTestId('journsconfs-tab')).toBeInTheDocument();
    });
  });

  it('отображает загрузку', () => {
    mockUseGetAuthorByIsandIdQuery.mockReturnValue({
      isLoading: true
    });

    renderWithProvider(<AuthorModal open={true} handleClose={handleClose} id={1} />);
    expect(screen.getByText('Загрузка информации об авторе...')).toBeInTheDocument();
  });

  it('отображает ошибку', () => {
    mockUseGetAuthorByIsandIdQuery.mockReturnValue({
      error: { status: 404 },
      isLoading: false
    });

    renderWithProvider(<AuthorModal open={true} handleClose={handleClose} id={1} />);
    expect(screen.getByText('Автор не найден')).toBeInTheDocument();
  });

  it('обрабатывает прозрачность фона при наличии модального окна ниже', async () => {
    renderWithProvider(<AuthorModal open={true} handleClose={handleClose} id={1} />);
    
    // Симулируем наличие другого модального окна
    const anotherModal = document.createElement('div');
    anotherModal.className = 'MuiModal-root';
    document.body.appendChild(anotherModal);

    await waitFor(() => {
      jest.advanceTimersByTime(100);
    });

    const modal = document.querySelector('.MuiModal-root');
    expect(modal).toBeInTheDocument();
    
    document.body.removeChild(anotherModal);
  });
}); 