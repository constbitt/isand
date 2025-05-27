import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrganisationOverviewTab from '@/src/components/Tabs/OrgOverviewTab';

describe('OrganisationOverviewTab', () => {
    const mockOrganisation = {
        org_name: 'Тестовая Организация',
        org_alt_names: 'Альт Название 1; Альт Название 2',
        ext_source: 'Test Source',
        ror: 'https://ror.org/test',
        url: 'https://test.org',
        wikidata: 'https://wikidata.org/test',
    };

    const mockAuthorsCount = 10;
    const mockPublicationsCount = 20;

    it('отображает все данные организации корректно', () => {
        render(
            <OrganisationOverviewTab
                organisation={mockOrganisation}
                authorsCount={mockAuthorsCount}
                publicationsCount={mockPublicationsCount}
            />
        );

        expect(screen.getByText('Альтернативные названия:')).toBeInTheDocument();
        expect(screen.getByText('Альт Название 1')).toBeInTheDocument();
        expect(screen.getByText('Альт Название 2')).toBeInTheDocument();
        expect(screen.getByText(/Количество авторов: 10/)).toBeInTheDocument();
        expect(screen.getByText(/Количество публикаций: 20/)).toBeInTheDocument();
        expect(screen.getByText(/Источник: Test Source/)).toBeInTheDocument();
    });

    it('отображает ссылки корректно', () => {
        render(
            <OrganisationOverviewTab
                organisation={mockOrganisation}
                authorsCount={mockAuthorsCount}
                publicationsCount={mockPublicationsCount}
            />
        );

        const rorLink = screen.getByRole('link', { name: mockOrganisation.ror });
        const urlLink = screen.getByRole('link', { name: mockOrganisation.url });
        const wikidataLink = screen.getByRole('link', { name: mockOrganisation.wikidata });

        expect(rorLink).toHaveAttribute('href', mockOrganisation.ror);
        expect(urlLink).toHaveAttribute('href', mockOrganisation.url);
        expect(wikidataLink).toHaveAttribute('href', mockOrganisation.wikidata);
    });

    it('отображает сообщения об отсутствующих данных', () => {
        const emptyOrganisation = {
            org_name: '',
            org_alt_names: '',
            ext_source: '',
            ror: '',
            url: '',
            wikidata: '',
        };

        render(
            <OrganisationOverviewTab
                organisation={emptyOrganisation}
                authorsCount={0}
                publicationsCount={0}
            />
        );

        expect(screen.getByText('не найдены')).toBeInTheDocument();
        expect(screen.getByText(/Ror: не найден/)).toBeInTheDocument();
        expect(screen.getByText(/Url: не найден/)).toBeInTheDocument();
        expect(screen.getByText(/Wikidata: не найден/)).toBeInTheDocument();
        expect(screen.getByText(/Источник: не найден/)).toBeInTheDocument();
    });
}); 