import AllPersonHat from "@/src/components/Cards/AllPersonHat";
import TabsComponent from "@/src/components/Tabs/TabsComponent";
import { useGetJournalAuthorQuery, useGetJournalInfoQuery, useGetJournalPublQuery } from "@/src/store/api/serverApiV3";
import { Box, CircularProgress, Container, Stack } from "@mui/material";
import Head from "next/head";
import { NextRouter, useRouter } from "next/router";
import React, { FC, ReactElement, useEffect, useState } from "react";
import ScienceObjectReview from "../CenterContainer/ScienceObjectReview";
import UniversalCard from "../Cards/UniversalCard";
import AuthorCard from "../Cards/AuthorCard";


const Authors: FC<{id: number}> = ({id}): ReactElement => {
    const [offset, setOffset] = useState<number>(0)
    const {data} = useGetJournalAuthorQuery({
        id: id,
        offset: offset,
        phrases: "",
    })

    return (
        <Stack>
            {data?.authors.map((author, index) => <AuthorCard key={index} author={{a_fio: author.name, a_aff_org_name: []}} />)}
        </Stack>
    )
}

const Publs: FC<{id: number}> = ({id}): ReactElement => {
    const [offset, setOffset] = useState<number>(0)
    const {data} = useGetJournalPublQuery({
        id: id,
        offset: offset,
        phrases: null,
    })

    return (
        <Stack>
            {data?.publications.map((publ, index) => <UniversalCard key={index} type="publication" creature={{id: 0, name: publ.name}} searchType="deepSearch/dResult" disabled={true} />)}
        </Stack>
    )
}

const JournalPage: React.FC = (): React.ReactElement => {
    const [idJournal, setIdJournal] = useState<number>(-1)
    const router: NextRouter = useRouter()

    const {data, isLoading} = useGetJournalInfoQuery(idJournal, {skip: idJournal < 0}) 

    useEffect(() => setIdJournal(parseInt(router.query.creature_id as string ?? '-1')), [router.isReady])
    
    const tabs: {label: string, component: React.ReactNode}[] = [
        {label: 'Обзор', component: <ScienceObjectReview idAuthor={idJournal} citations={0} description="" geoposition="" ids={[]} publications={data?.total_publications ?? 0} objectType="journals" />}, 
        {label: 'Публикации', component: <Publs id={idJournal} />}, 
        {label: 'Авторы', component: <Authors id={idJournal} />},
    ]

    if (isLoading || !data) {
        return <>
            <Head>
                <title>Профиль журнала</title>
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
                <title>Профиль журнала</title>
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

export default JournalPage;