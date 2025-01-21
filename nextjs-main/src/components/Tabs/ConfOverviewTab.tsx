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
        <Box sx={{ padding: 2, paddingLeft: 20, maxHeight: '600px', overflowY: 'auto' }}>
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