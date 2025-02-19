import { Typography, Box } from "@mui/material";

interface ConferenceOverviewTabProps {
    conference: {
        conf_name: string;
        conf_issns: string;
        conf_eissns: string;
        conf_isbns: string;
        ext_source: string;
    };
    authorsCount: number;
    publicationsCount: number;
}

const ConferenceOverviewTab: React.FC<ConferenceOverviewTabProps> = ({ conference, authorsCount, publicationsCount }) => {
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
            <Typography variant="h6" sx={{ marginBottom: 1, marginTop: 2  }}>
                ISSNs:
            </Typography>
            {conference.conf_issns ? (
                conference.conf_issns.split(';').map((issn, index) => (
                    <Typography key={index} variant="body1" sx={{ marginBottom: 1 }}>
                        {issn.trim()}
                    </Typography>
                ))
            ) : (
                <Typography variant="body1">не найдены</Typography>
            )}

            <Typography variant="h6" sx={{ marginBottom: 1, marginTop: 2  }}>
                E-ISSNs:
            </Typography>
            {conference.conf_eissns ? (
                conference.conf_eissns.split(';').map((eissn, index) => (
                    <Typography key={index} variant="body1" sx={{ marginBottom: 1 }}>
                        {eissn.trim()}
                    </Typography>
                ))
            ) : (
                <Typography variant="body1">не найдены</Typography>
            )}

            <Typography variant="h6" sx={{ marginBottom: 1, marginTop: 2 }}>
                E-ISBNs:
            </Typography>
            {conference.conf_isbns ? (
                conference.conf_isbns.split(';').map((isbn, index) => (
                    <Typography key={index} variant="body1" sx={{ marginBottom: 1 }}>
                        {isbn.trim()}
                    </Typography>
                ))
            ) : (
                <Typography variant="body1">не найдены</Typography>
            )}

            <Typography variant="h6" sx={{ marginBottom: 2, marginTop: 2 }}>
                Количество авторов: {authorsCount}
            </Typography>

            <Typography variant="h6" sx={{ marginBottom: 2, marginTop: 2 }}>
                Количество публикаций: {publicationsCount}
            </Typography>

            <Typography variant="h6" sx={{ marginBottom: 2, marginTop: 2 }}>
                Источник: {conference.ext_source || "не найден"}
            </Typography>
        </Box>
    );
};

export default ConferenceOverviewTab;