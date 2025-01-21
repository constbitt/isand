import { Typography, Link } from "@mui/material";

import { Box } from "@mui/material";


interface OrganisationOverviewTabProps {
    organisation: {
        org_name: string;
        org_alt_names: string;
        ext_source: string;
        ror: string;
        url: string;
        wikidata: string;
    };
    authorsCount: number;
    publicationsCount: number;
}

const OrganisationOverviewTab: React.FC<OrganisationOverviewTabProps> = ({ organisation, authorsCount, publicationsCount }) => {
    return (
        
        <Box sx={{ padding: 2, paddingLeft: 20, maxHeight: '600px', overflowY: 'auto', paddingBottom: 30 }}>

            <Typography variant="h6" sx={{ marginBottom: 2 }}>
                
            </Typography>

            <Typography variant="h6" sx={{ marginBottom: 1, marginTop: 2  }}>
                Альтернативные названия:
            </Typography>
            {organisation.org_alt_names ? (
                organisation.org_alt_names.split(';').map((alt_name, index) => (
                    <Typography key={index} variant="body1" sx={{ marginBottom: 1 }}>
                        {alt_name.trim()}
                    </Typography>
                ))
            ) : (
                <Typography variant="body1">не найдены</Typography>
            )}

            <Typography variant="h6" sx={{ marginBottom: 2, marginTop: 2   }}>
                Ror: {organisation.ror ? (
                    <Link href={organisation.ror} target="_blank" rel="noopener noreferrer">{organisation.ror}</Link>
                ) : "не найден"}
            </Typography>

            <Typography variant="h6" sx={{ marginBottom: 2, marginTop: 2   }}>
                Url: {organisation.url ? (
                    <Link href={organisation.url} target="_blank" rel="noopener noreferrer">{organisation.url}</Link>
                ) : "не найден"}
            </Typography>

            <Typography variant="h6" sx={{ marginBottom: 2, marginTop: 2   }}>
                Wikidata: {organisation.wikidata ? (
                    <Link href={organisation.wikidata} target="_blank" rel="noopener noreferrer">{organisation.wikidata}</Link>
                ) : "не найден"}
            </Typography>

            <Typography variant="h6" sx={{ marginBottom: 2, marginTop: 2   }}>
                Количество авторов: {authorsCount}
            </Typography>

            <Typography variant="h6" sx={{ marginBottom: 2, marginTop: 2  }}>
                Количество публикаций: {publicationsCount}
            </Typography>

            <Typography variant="h6" sx={{ marginBottom: 2, marginTop: 2 }}>
                Источник: {organisation.ext_source || "не найден"}
            </Typography>

        </Box>
    );
};

export default OrganisationOverviewTab;