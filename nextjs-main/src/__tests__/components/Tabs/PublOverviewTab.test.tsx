import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PublOverviewTab from '@/src/components/Tabs/PublOverviewTab';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { serverApiV2_5 } from '@/src/store/api/serverApiV2_5';

// Создаем мок store с минимально необходимой конфигурацией
const mockStore = configureStore({
    reducer: {
        [serverApiV2_5.reducerPath]: serverApiV2_5.reducer
    }
});

// Мок для RadarComponent, так как мы не тестируем его функциональность
jest.mock('@/src/components/Chart/RadarChart/Radarchart', () => {
    return function DummyRadarChart() {
        return <div data-testid="radar-chart">Radar Chart</div>;
    };
});

describe('PublOverviewTab', () => {
    const mockData = {
        annotation: 'Тестовая аннотация',
        publ_type: 'Статья',
        collect_type: 'Журнал',
        collect_name: 'Научный вестник',
        storageId: 123
    };

    const renderWithProvider = (component: React.ReactNode) => {
        return render(
            <Provider store={mockStore}>
                {component}
            </Provider>
        );
    };

    it('отображает все поля данных корректно', () => {
        renderWithProvider(<PublOverviewTab data={mockData} />);
        
        // Проверяем наличие всех заголовков
        expect(screen.getByText('Аннотация')).toBeInTheDocument();
        expect(screen.getByText('Тип публикации:')).toBeInTheDocument();
        expect(screen.getByText('Тип издания:')).toBeInTheDocument();
        expect(screen.getByText('Название издания:')).toBeInTheDocument();

        // Проверяем отображение данных
        expect(screen.getByText(mockData.annotation)).toBeInTheDocument();
        expect(screen.getByText(mockData.publ_type)).toBeInTheDocument();
        expect(screen.getByText(mockData.collect_type)).toBeInTheDocument();
        expect(screen.getByText(mockData.collect_name)).toBeInTheDocument();
    });

    it('отображает табы при наличии storageId', () => {
        renderWithProvider(<PublOverviewTab data={mockData} />);
        expect(screen.getByText('Факторы')).toBeInTheDocument();
        expect(screen.getByText('Подфакторы')).toBeInTheDocument();
        expect(screen.getByText('Термины')).toBeInTheDocument();
    });

    it('не отображает табы при отсутствии storageId', () => {
        const dataWithoutStorageId = {
            ...mockData,
            storageId: 0
        };
        renderWithProvider(<PublOverviewTab data={dataWithoutStorageId} />);
        
        expect(screen.queryByText('Факторы')).not.toBeInTheDocument();
        expect(screen.queryByText('Подфакторы')).not.toBeInTheDocument();
        expect(screen.queryByText('Термины')).not.toBeInTheDocument();
    });
}); 