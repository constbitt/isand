import { useGetOrgCardInfoQuery, useGetOrgAuthorsQuery, useGetOrgPublicationsQuery } from "@/src/store/api/serverApiV2_5"; // Импортируйте нужные хуки
import { Box, Modal, Stack, Typography, CircularProgress, Card } from "@mui/material";
import { FC, ReactElement, useEffect, useState } from "react";
import Head from "next/head";
import TabsComponent from "@/src/components/Tabs/TabsComponent";
import OrgPersonHatCard from "@/src/components/Cards/OrgPersonHat";
import { PublicationCard, formatAuthorName } from "@/src/components/Cards/PublicationCard";
import StyledAvatar from '@/src/components/Avatar/StyledAvatar';
import PublicationsTab from "@/src/components/Tabs/PublicationsTab";
import AuthorsTab from "@/src/components/Tabs/AuthorsTab";
import OrganisationOverviewTab from "@/src/components/Tabs/OrgOverviewTab";

interface OrganisationModalProps {
    open: boolean;
    handleClose: () => void;
    id: number;
}

const OrganisationModal: FC<OrganisationModalProps> = ({ open, handleClose, id }): ReactElement => {
    const { data, isLoading } = useGetOrgCardInfoQuery(id, { skip: id < 0 });
    const { data: authorsData } = useGetOrgAuthorsQuery(id, { skip: id < 0 }); // Получение авторов
    const { data: publicationsData, isLoading: publicationsLoading } = useGetOrgPublicationsQuery(id, { skip: id < 0 }); // Получение публикаций
    const [tabIndex, setTabIndex] = useState(0); // Состояние для текущей вкладки
    const [hasModalBelow, setHasModalBelow] = useState(false);
    const handleTabChange = (newValue: number) => {
        setTabIndex(newValue);
    };

    const tabs = [
        { label: "Обзор", component: <OrganisationOverviewTab organisation={data?.[0] || {}} authorsCount={authorsData?.length || 0} publicationsCount={publicationsData?.length || 0} /> },
        { label: "Публикации", component: <PublicationsTab publications={publicationsData || []} isLoading={publicationsLoading} /> },
        { label: "Авторы", component: <AuthorsTab authors={authorsData || []} isLoading={isLoading} /> },
        //{ label: "Журналы и Конференции", component: <JournalsAndConferencesTab /> },
    ];



    useEffect(() => {
        setTimeout(() => {
            const modals = document.querySelectorAll('.MuiModal-root');
            if (modals.length > 1 && open) {
                setHasModalBelow(true);
            } else {
                setHasModalBelow(false);
            }
        }, 100);
    }, [open]);

    return (
        <Modal
            open={open}
            onClose={handleClose}
            sx={{
                display: 'flex',
                justifyContent: 'center',
                maxHeight: '100vh',
                margin: '10px 0px',
            }}
            slotProps={{
                backdrop: {
                    sx: {
                        backgroundColor: hasModalBelow ? 'transparent' : 'rgba(0, 21, 64, 0.75)',
                    },
                },
            }}
        >
            <Box
                sx={{
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    py: 3,
                    px: 4,
                    borderRadius: 2,
                    width: '80%',
                }}
            >
                <Head>
                    <title>Профиль организации</title>
                </Head>
                {isLoading ? (
                    <Typography>Загрузка информации об организации...</Typography>
                ) : (
                    <>
                    
                        {data && (
                            <OrgPersonHatCard 
                                id={data[0]?.org_isand_id}
                            />
                        )}
                        <Box sx={{ mt: 4 }}></Box>
                        <TabsComponent
                            tabs={tabs.map((tab) => ({ label: tab.label, component: tab.component }))}
                            variant="fullWidth"
                            onChange={handleTabChange}
                            propsValue={tabIndex}
                            fontSize={25}
                        />
                        {tabs[tabIndex].component}
                    </>
                )}
            </Box>
        </Modal>
    );
};


const JournalsAndConferencesTab: React.FC = () => {
    return (
        <Box>
            <Typography variant="h6">Журналы и Конференции</Typography>
            {/* Добавьте содержимое для журналов и конференций */}
        </Box>
    );
};

export default OrganisationModal;
