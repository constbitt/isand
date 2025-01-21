import { Box, Stack, Typography, CircularProgress, Card, Grid } from "@mui/material";
import JournalModal from "../Modals/JournalModal";
import { JournalCard } from "../Cards/JournalCard";
import ConferenceModal from "../Modals/ConferenceModal";
import { useState } from "react";

const JournsConfsTab: React.FC<{ journals: any[], conferences: any[], isLoading: boolean }> = ({ journals, conferences, isLoading }) => {
    const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
    const [isConferenceModalOpen, setIsConferenceModalOpen] = useState(false);
    const [selectedJournalId, setSelectedJournalId] = useState<number | null>(null);
    const [selectedConferenceId, setSelectedConferenceId] = useState<number | null>(null);
    const handleOpenJournalModal = (id: number) => {
        setSelectedJournalId(id);
        setIsJournalModalOpen(true);
      };
    
      const handleCloseJournalModal = () => {
        setIsJournalModalOpen(false);
        setSelectedJournalId(null);
      };
    
      const handleOpenConferenceModal = (id: number) => {
        setSelectedConferenceId(id);
        setIsConferenceModalOpen(true);
      };
    
      const handleCloseConferenceModal = () => {
        setIsConferenceModalOpen(false);
        setSelectedConferenceId(null);
    };
    
    return (
        <Box
            sx={{
                height: 'calc(100vh - 300px)',
                overflowY: 'auto',
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
            {isLoading ? (
                <Stack alignItems="center" justifyContent="center" sx={{ height: '100px' }}>
                    <CircularProgress />
                </Stack>
            ) : (
                    <Grid container spacing={2} sx={{ pl: 13 }}>
                        <Grid item xs={6}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
                            Журналы
                            </Typography>
                            <Stack spacing={2}>
                            {journals && journals.length > 0 ? (
                                journals.map((journal) => (
                                <div onClick={() => handleOpenJournalModal(journal.journal_isand_id)} key={journal.journal_isand_id} style={{ cursor: 'pointer' }}>
                                    <JournalCard post={{ id: journal.journal_isand_id, name: journal.journal_name, avatar: journal.avatar }} />
                                </div>
                                ))
                            ) : (
                                <Typography>Журналы не найдены</Typography>
                            )}
                            </Stack>
                            <JournalModal 
                            open={isJournalModalOpen} 
                            handleClose={handleCloseJournalModal}
                            id={selectedJournalId!}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
                            Конференции
                            </Typography>
                            <Stack spacing={2} sx={{ pr: 1 }}>
                            {conferences && conferences.length > 0 ? (
                                conferences.map((conference) => (
                                <div onClick={() => handleOpenConferenceModal(conference.conf_isand_id)} key={conference.conf_isand_id} style={{ cursor: 'pointer' }}>
                                    <JournalCard post={{ id: conference.conf_isand_id, name: conference.conf_name, avatar: conference.avatar }} />
                                </div>
                                ))
                            ) : (
                                <Typography>Конференции не найдены</Typography>
                            )}
                            </Stack>
                            <ConferenceModal 
                            open={isConferenceModalOpen} 
                            handleClose={handleCloseConferenceModal}
                            id={selectedConferenceId!}
                            />
                        </Grid>
                    </Grid>    
            )}
        </Box>
    );
};

export default JournsConfsTab;
