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