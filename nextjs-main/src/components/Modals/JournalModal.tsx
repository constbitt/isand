import { useGetJournalInfoQuery, useGetJournalPublicationsQuery, useGetJournalAuthorsQuery } from "@/src/store/api/serverApiV2_5"; // Импортируйте нужный хук
import { Box, Modal, Typography } from "@mui/material";
import { FC, ReactElement, useEffect, useState } from "react";
import Head from "next/head";
import AuthorsTab from "../Tabs/AuthorsTab";
import PublicationsTab from "../Tabs/PublicationsTab";
import JournalPersonHatCard from "../Cards/JournalPersonHat";
import TabsComponent from "../Tabs/TabsComponent";
import JournalOverviewTab from "../Tabs/JournalOverviewTab";

interface JournalModalProps {
    open: boolean;
    handleClose: () => void;
    id: number;
}

const JournalModal: FC<JournalModalProps> = ({ open, handleClose, id }): ReactElement => {
    const { data, isLoading } = useGetJournalInfoQuery(id, { skip: id < 0 });
    const { data: authorsData } = useGetJournalAuthorsQuery(id, { skip: id < 0 });
    const { data: publicationsData, isLoading: publicationsLoading } = useGetJournalPublicationsQuery(id, { skip: id < 0 });
    const [tabIndex, setTabIndex] = useState(0);
    const [hasModalBelow, setHasModalBelow] = useState(false);
    const handleTabChange = (newValue: number) => {
        setTabIndex(newValue);
    };

    const tabs = [
        { label: "Обзор", component: <JournalOverviewTab journal={data?.[0] || {}} authorsCount={authorsData?.length || 0} publicationsCount={publicationsData?.length || 0} /> },
        { label: "Публикации", component: <PublicationsTab publications={publicationsData || []} isLoading={publicationsLoading} /> },
        { label: "Авторы", component: <AuthorsTab authors={authorsData || []} isLoading={isLoading} /> },
        //{ label: "Организации", component: <OrganisationsTab /> },
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
                    <title>Профиль журнала</title>
                </Head>
                {isLoading ? (
                    <Typography>Загрузка информации о журнале...</Typography>
                ) : (
                    <>
                    
                        {data && (
                            <JournalPersonHatCard 
                                id={data[0].journal_isand_id}
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


export default JournalModal;
