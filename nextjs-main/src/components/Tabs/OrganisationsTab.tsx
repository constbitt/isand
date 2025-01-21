// @ts-nocheck
import { Box, Stack, Typography, CircularProgress, Card } from "@mui/material";
import { OrganisationCard } from '@/src/components/Cards/OrganisationCard';
import { FC, ReactElement, useEffect, useState } from "react";
import OrganisationModal from "../Modals/OrganisationModal";

const OrganisationsTab: React.FC<{ organisations: any[], isLoading: boolean }> = ({ organisations, isLoading }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrganisationId, setSelectedOrganisationId] = useState<number | null>(null);
    const handleOpenOrganisationModal = (id: number) => {
        setSelectedOrganisationId(id);
        setIsModalOpen(true);
      };
    
      const handleCloseOrganisationModal = () => {
        setIsModalOpen(false);
        setSelectedOrganisationId(null);
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
                    {organisations.length > 0 ? (
                        organisations.map((organisation) => (
                            <OrganisationCard 
                                key={organisation.org_isand_id}
                                post={{ 
                                    id: organisation.org_isand_id, 
                                    name: organisation.org_name, 
                                    ror: organisation.ror, 
                                    avatar: organisation.avatar 
                                }} 
                                onClick={() => handleOpenOrganisationModal(organisation.org_isand_id)}
                            />
                        ))
                    ) : (
                        <Typography>Нет организаций для отображения.</Typography>
                    )}
                </Stack>

            )}
            {isModalOpen && (
                <OrganisationModal 
                    open={isModalOpen} 
                    handleClose={handleCloseOrganisationModal}
                    id={selectedOrganisationId!}
                />
            )}
        </Box>
    );
};

export default OrganisationsTab;
