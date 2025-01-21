import { Typography } from "@mui/material";
import { Box } from "@mui/material";

interface JournalOverviewTabProps {
    journal: {
        journal_name: string;
        journal_issns: string;
        journal_eissns: string;
        ext_source: string;
    };
    authorsCount: number;
    publicationsCount: number;
}

const JournalOverviewTab: React.FC<JournalOverviewTabProps> = ({ journal, authorsCount, publicationsCount }) => {
    return (
        
        <Box sx={{ padding: 2, paddingLeft: 20, maxHeight: '600px', overflowY: 'auto' }}>

            <Typography variant="h6" sx={{ marginBottom: 2 }}>
                
            </Typography>

            <Typography variant="h6" sx={{ marginBottom: 1, marginTop: 2  }}>
                ISSNs:
            </Typography>
            {journal.journal_issns ? (
                journal.journal_issns.split(';').map((issn, index) => (
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
            {journal.journal_eissns ? (
                journal.journal_eissns.split(';').map((eissn, index) => (
                    <Typography key={index} variant="body1" sx={{ marginBottom: 1 }}>
                        {eissn.trim()}
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
                Источник: {journal.ext_source || "не найден"}
            </Typography>

        </Box>
    );
};

export default JournalOverviewTab;