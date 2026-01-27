// @ts-nocheck


import React, { FC, ReactElement, useEffect, useState } from "react";
import Head from 'next/head';
import { NextRouter, useRouter } from 'next/router';
import { Box, Typography, Container, Stack, IconButton, MenuItem, CircularProgress, Card } from "@mui/material";
import { Author } from '@/src/store/types/authorTypes';
import { ApiResponse } from '@/src/store/types/apiTypes';
import { useInView } from "react-intersection-observer";
import { wrapper } from '@/src/store/store';
import { getJournals, useGetAuthorsPostsQuery } from "@/src/store/api/serverApi";
import { useGetJournalAuthorQuery, useGetJournalInfoQuery, useGetJournalPublQuery } from '@/src/store/api/serverApiV3';
import { useGetJournalByNameInfoQuery, useGetJournalAuthorsQuery, useGetJournalPublicationsQuery  } from "@/src/store/api/serverApiV2_5";
import AllPersonHat from "@/src/components/Cards/AllPersonHat";
import TabsComponent from "@/src/components/Tabs/TabsComponent";
import ScienceObjectReview from "../CenterContainer/ScienceObjectReview";
import UniversalCard from "../Cards/UniversalCard";
import AuthorCard from "../Cards/AuthorCard";
import AuthorsTab from "../Tabs/AuthorsTab";
import PublicationsTab from "../Tabs/PublicationsTab";

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

const JournalSearchPage: React.FC<{ journalsResponse: ApiResponse<Author[]> }> = ({ journalsResponse }) => {
    const [nameJournal, setNameJournal] = useState<string>('')
    const router: NextRouter = useRouter()
        const getQueryParameter = (url: string, parameter: string) => {
        const urlParams = new URLSearchParams(url);
        return urlParams.get(parameter);
    };

    const { data: journals, error: journalsError } = journalsResponse;

    const journalName = typeof window !== 'undefined' ? getQueryParameter(window.location.href, "name") || "" : "";

    useEffect(() => {
            if (journals && journalName) {
                const foundJournal = journals.find((journal) => journal.value === journalName);
                setNameJournal(foundJournal?.name as string ?? '');
            } else {
                setNameJournal(router.query.name as string ?? '');
            }
    }, [journals, router.isReady, router.query.name]);

    const { data: similarJournals = [], isLoading } = useGetJournalByNameInfoQuery(nameJournal ?? "", {
    skip: !nameJournal,
    });

    const normalized = nameJournal.trim().toLowerCase();

    const journal =
    similarJournals.find(
        j =>
            j.journal_name.trim().toLowerCase() === normalized &&
            j.ext_source === 'БД ИПУ РАН'
    ) ||    similarJournals.find(
        j => j.journal_name.trim().toLowerCase() === normalized
    );

    const journalIsandId = journal?.journal_isand_id;

    const {data, journalIsLoading} = useGetJournalInfoQuery(journalIsandId ?? -1, {skip: !journalIsandId }) 

    const { data: authorsData } = useGetJournalAuthorsQuery(journalIsandId ?? -1, { 
        skip: !journalIsandId 
    });
    const { data: publicationsData, isLoading: publicationsLoading } = useGetJournalPublicationsQuery(journalIsandId ?? -1, { 
        skip: !journalIsandId 
    });
    const tabs: {label: string, component: React.ReactNode}[] = [
        {label: 'Обзор', component: <ScienceObjectReview idAuthor={journalIsandId} citations={0} description="" geoposition="" ids={[]} publications={(data?.total_publications || journal?.publ_count) ?? 0} objectType="journals" />}, 
        { label: "Публикации", component: <PublicationsTab publications={publicationsData || []} isLoading={publicationsLoading} /> },
        { label: "Авторы", component: <AuthorsTab authors={authorsData || []} isLoading={isLoading} /> },
    ]

    if (isLoading || !journal) {
        return <>
            <Head>
                <title>Журнал</title>
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
                <title>Журнал</title>
            </Head>
            <Container>
                <Stack spacing={12} sx={{mt: '60px', justifyContent: 'center'}}>
                    <AllPersonHat name={journal.journal_name} avatar={""} geoposition={""} />
                    <TabsComponent tabs={tabs} fontSize={26} variant="standard" />
                </Stack>
            </Container>
        </>
    );
} 




export const getServerSideProps = wrapper.getServerSideProps(
    (store) => async () => {
      await store.dispatch(getJournals.initiate());
      const journalsResponse = getJournals.select()(store.getState());
  
      return {
        props: {
          journalsResponse,
        },
      };
    }
  );
  

export default JournalSearchPage;