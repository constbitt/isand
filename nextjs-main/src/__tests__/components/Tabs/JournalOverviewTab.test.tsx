import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import JournalOverviewTab from '@/src/components/Tabs/JournalOverviewTab';

describe('JournalOverviewTab', () => {
    const mockJournal = {
        journal_name: 'Test Journal',
        journal_issns: '1234-5678;8765-4321',
        journal_eissns: '2345-6789',
        ext_source: 'Test Source'
    };

    const mockAuthorsCount = 10;
    const mockPublicationsCount = 20;

    it('отображает ISSN корректно', () => {
        render(
            <JournalOverviewTab 
                journal={mockJournal}
                authorsCount={mockAuthorsCount}
                publicationsCount={mockPublicationsCount}
            />
        );

        expect(screen.getByText('1234-5678')).toBeInTheDocument();
        expect(screen.getByText('8765-4321')).toBeInTheDocument();
    });

    it('отображает E-ISSN корректно', () => {
        render(
            <JournalOverviewTab 
                journal={mockJournal}
                authorsCount={mockAuthorsCount}
                publicationsCount={mockPublicationsCount}
            />
        );

        expect(screen.getByText('2345-6789')).toBeInTheDocument();
    });

    it('отображает количество авторов и публикаций', () => {
        render(
            <JournalOverviewTab 
                journal={mockJournal}
                authorsCount={mockAuthorsCount}
                publicationsCount={mockPublicationsCount}
            />
        );

        expect(screen.getByText('Количество авторов: 10')).toBeInTheDocument();
        expect(screen.getByText('Количество публикаций: 20')).toBeInTheDocument();
    });

    it('отображает источник', () => {
        render(
            <JournalOverviewTab 
                journal={mockJournal}
                authorsCount={mockAuthorsCount}
                publicationsCount={mockPublicationsCount}
            />
        );

        expect(screen.getByText('Источник: Test Source')).toBeInTheDocument();
    });

    it('отображает "не найдены" когда ISSN отсутствует', () => {
        const journalWithoutIssn = {
            ...mockJournal,
            journal_issns: ''
        };

        render(
            <JournalOverviewTab 
                journal={journalWithoutIssn}
                authorsCount={mockAuthorsCount}
                publicationsCount={mockPublicationsCount}
            />
        );

        expect(screen.getByText('не найдены')).toBeInTheDocument();
    });
}); 