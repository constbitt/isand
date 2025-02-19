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
        
        <Box 
            sx={{
                height: 'calc(100vh - 300px)',
                overflow: 'auto',
                paddingLeft: 20,
                '&::-webkit-scrollbar': {
                    width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                    borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: '#888',
                    borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                    background: '#555',
                },
            }}
        >

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