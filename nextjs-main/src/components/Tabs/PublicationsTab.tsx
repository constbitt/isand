import { Box, Stack, Typography, CircularProgress, Card } from "@mui/material";
import { formatAuthorName } from "@/src/components/Cards/PublicationCard";
import { useState, useEffect } from "react";
import { useGetPublCardInfoQuery } from "@/src/store/api/serverApiV2_5";
import PublicationModal from "@/src/components/Modals/PublicationModal";

const PublicationsTab: React.FC<{ publications: any[], isLoading: boolean }> = ({ publications, isLoading }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPublicationId, setSelectedPublicationId] = useState<number | null>(null);
    
    const handleOpenPublicationModal = (id: number, isIsandId: boolean) => {
        setSelectedPublicationId(id);
        setIsModalOpen(true);
    };

    const handleClosePublicationModal = () => {
        setIsModalOpen(false);
        setSelectedPublicationId(null);
    };

    return (
        <Box
            sx={{
                height: 'calc(100vh - 300px)',
                overflow: 'auto',
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
                <Stack spacing={2} alignItems="center" sx={{ mt: '20px' }}>
                    {publications.length > 0 ? (
                        publications.map((post) => {
                            return (
                                <Card 
                                    key={post.publ_isand_id}
                                    sx={{ 
                                        p: 3,
                                        m: '10px',
                                        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
                                        cursor: 'pointer',
                                        width: '99%',
                                    }}
                                    onClick={() => handleOpenPublicationModal(post.publ_isand_id, true)}
                                >
                                    <Stack spacing={2} alignItems="flex-start">
                                        <Typography 
                                            variant='h6' 
                                            sx={{ 
                                                textAlign: 'left',
                                                width: '100%',
                                            }}
                                        >
                                            {post.publ_name}
                                        </Typography>
                                        <Typography 
                                            variant='body1' 
                                            sx={{ 
                                                color: '#1B4596',
                                                fontFamily: 'Nunito Sans, sans-serif',
                                                textAlign: 'left',
                                                width: '100%',
                                                fontWeight: 700
                                            }}
                                        >
                                            Авторы: {formatAuthorName(post.author_fios)}
                                        </Typography>
                                        <Typography 
                                            variant='body2' 
                                            sx={{
                                                color: 'text.secondary',
                                                textAlign: 'left',
                                                width: '100%'
                                            }}
                                        >
                                            Год: {post.year}
                                        </Typography>
                                    </Stack>
                                </Card>
                            );
                        })
                    ) : (
                        <Typography>Нет публикаций для отображения.</Typography>
                    )}
                </Stack>
            )}
            {isModalOpen && (
                <PublicationModal 
                    open={isModalOpen} 
                    handleClose={handleClosePublicationModal} 
                    id={selectedPublicationId!} 
                    isIsandId={true}
                />
            )}
        </Box>
    );
};

export default PublicationsTab;
