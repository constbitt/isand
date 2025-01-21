import { Box, Stack, Typography, CircularProgress, Card } from "@mui/material";
import StyledAvatar from '@/src/components/Avatar/StyledAvatar';
import AuthorModal from '@/src/components/Modals/AuthorModal';
import { useEffect, useState } from 'react';

const AuthorsTab: React.FC<{ authors: any[], isLoading: boolean }> = ({ authors, isLoading }) => {
    const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
    const [selectedAuthorId, setSelectedAuthorId] = useState<number | null>(null);

    const handleOpenAuthorModal = (id: number) => {
        setSelectedAuthorId(id);
        setIsAuthorModalOpen(true);
    };

    const handleCloseAuthorModal = () => {
        setIsAuthorModalOpen(false);
        setSelectedAuthorId(null);
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
                    {authors.length > 0 ? (
                        authors.map((author) => (
                            <Card 
                                key={author.author_isand_id}
                                sx={{ 
                                    p: 3,
                                    m: '10px',
                                    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
                                    cursor: 'pointer',
                                    width: '99%',
                                }}
                                onClick={() => handleOpenAuthorModal(author.author_isand_id)}
                            >
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <StyledAvatar
                                        fio={author.author_fio || "Без названия"}
                                        width={50}
                                        height={50}
                                        url={author.avatar || ""}
                                    />
                                    <Typography variant="h6" sx={{ textAlign: 'left' }}>
                                        {author.author_fio}
                                    </Typography>
                                </Stack>
                            </Card>
                        ))
                    ) : (
                        <Typography>Нет авторов для отображения.</Typography>
                    )}
                </Stack>
            )}
            <AuthorModal 
                open={isAuthorModalOpen} 
                handleClose={handleCloseAuthorModal}
                id={selectedAuthorId!}
            />
        </Box>
    );
};

export default AuthorsTab; 