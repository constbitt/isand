import AllPersonHat from "@/src/components/Cards/AllPersonHat";
import TabsComponent from "@/src/components/Tabs/TabsComponent";
import { useGetConferenceInfoQuery } from "@/src/store/api/serverApiV3";
import { Box, CircularProgress, Container, Stack, Typography } from "@mui/material";
import Head from "next/head";
import { NextRouter, useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import ScienceObjectReview from "../CenterContainer/ScienceObjectReview";


const ConferencePage: React.FC = (): React.ReactElement => {
    const [idConf, setIdConf] = useState<number>(-1)
    const router: NextRouter = useRouter()

    const {data, isLoading} = useGetConferenceInfoQuery(idConf, {skip: idConf < 0}) 

    useEffect(() => setIdConf(parseInt(router.query.creature_id as string ?? '-1')), [router.isReady])
    
    const tabs: {label: string, component: React.ReactNode}[] = [
        {label: 'Обзор', component: <ScienceObjectReview idAuthor={idConf} citations={0} description="" geoposition="" ids={[]} publications={data?.total_publications ?? 0} objectType="conferences" />}, 
        {label: 'Публикации', component: <></>}, 
        {label: 'Авторы', component: <></>},
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