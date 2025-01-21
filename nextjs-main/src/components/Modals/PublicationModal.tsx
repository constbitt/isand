// @ts-nocheck
import { useGetPublInfoQuery, useGetPublCardInfoQuery, useGetPublIsandInfoQuery } from "@/src/store/api/serverApiV2_5";
import { Box, Stack, Modal, Typography } from "@mui/material";
import RadarComponent from '@/src/components/Chart/RadarChart/Radarchart';
import TabsComponent from '@/src/components/Tabs/TabsComponent';
import { FC, ReactElement, useEffect, useState } from "react";
import Head from "next/head";
import PublicationsTab from "../Tabs/PublicationsTab";
import JournsConfsTab from "../Tabs/JournsConfsTab";
import AuthorsTab from "../Tabs/AuthorsTab";
import PublOverviewTab from "../Tabs/PublOverviewTab";

interface PublicationModalProps {
    open: boolean;
    handleClose: () => void;
    id: number;
    isIsandId: boolean;
}

const PublicationModal: FC<PublicationModalProps> = ({ open, handleClose, id, isIsandId }): ReactElement => {
    const { data: publInfoData, isLoading: isLoadingPublInfo } = useGetPublInfoQuery(id, { skip: !open || id < 0 });
    const { data: publIsandData, isLoading: isLoadingPublIsand } = useGetPublIsandInfoQuery(id, { skip: !open || id < 0 });
    
    const data = isIsandId ? publIsandData : publInfoData;
    const isLoading = isIsandId ? isLoadingPublIsand : isLoadingPublInfo;

    const publIsandId = isIsandId ? id : data?.[0]?.publ_isand_id;
    const [hasModalBelow, setHasModalBelow] = useState(false);
    const { data: publCardInfo } = useGetPublCardInfoQuery(publIsandId as number, { 
        skip: !open || !publIsandId
    });
/*
    const tabs: { label: string, component: React.ReactNode }[] = [
        { label: 'Факторы', component: <RadarComponent level={1} id={[publIsandId as number]} include_common_terms={0} object_type='publications' /> },
        { label: 'Подфакторы', component: <RadarComponent level={2} id={[publIsandId as number]} include_common_terms={0} object_type='publications' /> },
        { label: 'Термины', component: <RadarComponent level={3} id={[publIsandId as number]} include_common_terms={0} object_type='publications' /> },
    ];
    */

    const [authorsList, setAuthorsList] = useState<{ author_fio: string; author_isand_id: string }[]>([]);

    useEffect(() => {
        if (data && data.length > 0) {
            const authorsFios = data[0].author_fios.split(';').map(fio => fio.trim());
            const authorsIds = data[0].author_isand_ids.split(';').map(id => id.trim());
            setAuthorsList(authorsFios.map((fio, index) => ({
                author_fio: fio,
                author_isand_id: authorsIds[index]
            })));
        }
    }, [data]);


    const tabs = [
        { 
            label: "Обзор", 
            component: publCardInfo ? (
                <PublOverviewTab data={{
                    annotation: (publCardInfo[0] as any).annotation || 'Нет аннотации',
                    publ_type: (publCardInfo[0] as any).publ_type || 'Не указан',
                    collect_type: (publCardInfo[0] as any).collect_type || 'Не указан',
                    collect_name: (publCardInfo[0] as any).collect_name || 'Не указано'
                }} />
            ) : (
                <Typography>Загрузка данных...</Typography>
            )
        },
        { label: "Авторы", component: <AuthorsTab authors={authorsList} isLoading={isLoading} /> },
        //{ label: "Журналы и конференции", component: <JournsConfsTab journals={authorJournals || []} conferences={authorConferences || []} isLoading={isLoading} /> },
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
                    <title>Профиль публикации</title>
                </Head>
                {publCardInfo && (
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            color: '#1B4596', 
                            fontSize: '50px',
                            fontWeight: 400,
                            lineHeight: 1,
                            textAlign: 'center'
                        }}
                    >
                        {publCardInfo[0].publ_name}
                    </Typography>
                )}
                <Box sx={{ mt: 4 }}></Box>
                    <TabsComponent
                        tabs={tabs.map((tab) => ({ label: tab.label, component: tab.component }))}
                        fontSize={25}
                    />
                
            </Box>
        </Modal>
    );
};

export default PublicationModal; 