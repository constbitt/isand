import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConferenceOverviewTab from '../../../components/Tabs/ConfOverviewTab';

describe('ConferenceOverviewTab', () => {
    const mockConference = {
        conf_name: 'Test Conference',
        conf_issns: '1234-5678;8765-4321',
        conf_eissns: '2345-6789',
        conf_isbns: '978-0-123456-78-9;978-0-987654-32-1',
        ext_source: 'Test Source'
    };

    const mockAuthorsCount = 10;
    const mockPublicationsCount = 5;

    it('отображает все ISSN из списка', () => {
        render(
            <ConferenceOverviewTab 
                conference={mockConference}
                authorsCount={mockAuthorsCount}
                publicationsCount={mockPublicationsCount}
            />
        );

        expect(screen.getByText('1234-5678')).toBeInTheDocument();
        expect(screen.getByText('8765-4321')).toBeInTheDocument();
    });

    it('отображает E-ISSN', () => {
        render(
            <ConferenceOverviewTab 
                conference={mockConference}
                authorsCount={mockAuthorsCount}
                publicationsCount={mockPublicationsCount}
            />
        );

        expect(screen.getByText('2345-6789')).toBeInTheDocument();
    });

    it('отображает все ISBN из списка', () => {
        render(
            <ConferenceOverviewTab 
                conference={mockConference}
                authorsCount={mockAuthorsCount}
                publicationsCount={mockPublicationsCount}
            />
        );

        expect(screen.getByText('978-0-123456-78-9')).toBeInTheDocument();
        expect(screen.getByText('978-0-987654-32-1')).toBeInTheDocument();
    });

    it('отображает количество авторов и публикаций', () => {
        render(
            <ConferenceOverviewTab 
                conference={mockConference}
                authorsCount={mockAuthorsCount}
                publicationsCount={mockPublicationsCount}
            />
        );

        expect(screen.getByText('Количество авторов: 10')).toBeInTheDocument();
        expect(screen.getByText('Количество публикаций: 5')).toBeInTheDocument();
    });

    it('отображает источник', () => {
        render(
            <ConferenceOverviewTab 
                conference={mockConference}
                authorsCount={mockAuthorsCount}
                publicationsCount={mockPublicationsCount}
            />
        );

        expect(screen.getByText('Источник: Test Source')).toBeInTheDocument();
    });

    it('отображает "не найдены" когда данные отсутствуют', () => {
        const emptyConference = {
            conf_name: 'Test Conference',
            conf_issns: '',
            conf_eissns: '',
            conf_isbns: '',
            ext_source: ''
        };

        render(
            <ConferenceOverviewTab 
                conference={emptyConference}
                authorsCount={0}
                publicationsCount={0}
            />
        );

        const notFoundElements = screen.getAllByText('не найдены');
        expect(notFoundElements).toHaveLength(3); // Для ISSN, E-ISSN и ISBN

        expect(screen.getByText('Источник: не найден')).toBeInTheDocument();
    });
}); 