import AllPersonHat from "@/src/components/Cards/AllPersonHat";
import TabsComponent from "@/src/components/Tabs/TabsComponent";
import { useGetConferenceInfoQuery } from "@/src/store/api/serverApiV3";
import {useGetConferenceByNameInfoQuery, useGetConferenceAuthorsQuery, useGetConferencePublicationsQuery } from "@/src/store/api/serverApiV2_5"
import { Box, CircularProgress, Container, Stack, Typography } from "@mui/material";
import Head from "next/head";
import { NextRouter, useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import ScienceObjectReview from "../CenterContainer/ScienceObjectReview";
import PublicationsTab from "../Tabs/PublicationsTab";
import AuthorsTab from "../Tabs/AuthorsTab";


const ConferencePage: React.FC = (): React.ReactElement => {
    const [idConf, setIdConf] = useState<number>(-1)
    const router: NextRouter = useRouter()

    const {data, isLoading} = useGetConferenceInfoQuery(idConf, {skip: idConf < 0}) 

    useEffect(() => setIdConf(parseInt(router.query.creature_id as string ?? '-1')), [router.isReady])
    

    const {data: conferenceData} = useGetConferenceByNameInfoQuery(data?.name ?? '')
    const conferenceIsandId = conferenceData && conferenceData[0]?.conf_isand_id
    const { data: authorsData } = useGetConferenceAuthorsQuery(conferenceIsandId ?? -1, { 
        skip: !conferenceIsandId 
    });
    const { data: publicationsData, isLoading: publicationsLoading } = useGetConferencePublicationsQuery(conferenceIsandId ?? -1, { 
        skip: !conferenceIsandId 
    });

    const tabs: {label: string, component: React.ReactNode}[] = [
        {label: 'Обзор', component: <ScienceObjectReview idAuthor={idConf} citations={0} description="" geoposition="" ids={[]} publications={data?.total_publications ?? 0} objectType="conferences" />}, 
        { label: "Публикации", component: <PublicationsTab publications={publicationsData || []} isLoading={publicationsLoading} /> },
        { label: "Авторы", component: <AuthorsTab authors={authorsData || []} isLoading={isLoading} /> },
    ]

    if (isLoading || !data) {
        return <>
            <Head>
                <title>Профиль конференции</title>
            </Head>
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%'
            }}>
                <CircularProgress />
            </Box>
        </>
    }

    return (
        <>
            <Head>
                <title>Профиль конференции</title>
            </Head>
            <Container>
                <Stack spacing={12} sx={{mt: '60px', justifyContent: 'center'}}>
                    <AllPersonHat name={data.name} avatar={""} geoposition={""} />
                    <TabsComponent tabs={tabs} fontSize={26} variant="standard" />
                </Stack>
            </Container>
        </>
    );
} 

export default ConferencePage;