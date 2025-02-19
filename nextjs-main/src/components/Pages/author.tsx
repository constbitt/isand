import React, { useEffect, useState } from 'react'
import Head from 'next/head';
import AuthorPersonHatCard from '@/src/components/Cards/AuthorPersonHat';
import { useGetAuthorInfoQuery } from '@/src/store/api/serverApiV3';
import { NextRouter, useRouter } from 'next/router';
import ScienceObjectReview from '@/src/components/CenterContainer/ScienceObjectReview';
import { calculateAllCount } from '@/src/tools/calculateAllCount';

import { Box, Typography, Container, Stack, IconButton, MenuItem, CircularProgress, Card } from "@mui/material";
import TabsComponent from "@/src/components/Tabs/TabsComponent";
import { getAuthors, useGetAuthorsPostsQuery } from "@/src/store/api/serverApi";
import { useGetAuthorJournalsQuery, useGetAuthorConferencesQuery, useGetAuthorsActivityQuery, useGetAuthorByPrndQuery, useGetOrgInfoQuery, useGetAuthorByFioQuery, useGetPublicationsByAuthorIdQuery } from "@/src/store/api/serverApiV2_5";
import AuthorTabContent from '@/src/components/CenterContainer/AuthorTabContent';
import { parseStringToArray } from '@/src/tools/parseStringToArray';
import { useInView } from "react-intersection-observer";
import { wrapper } from '@/src/store/store';
import { Author } from '@/src/store/types/authorTypes';
import { ApiResponse } from '@/src/store/types/apiTypes';
import AuthorOverviewTab from "../Tabs/AuthorOverviewTab";
import PublicationsTab from "../Tabs/PublicationsTab";
import JournsConfsTab from "../Tabs/JournsConfsTab";
import OrganisationsTab from "../Tabs/OrganisationsTab";

const AuthorPage: React.FC = (): React.ReactElement => {
    const [idAuthor, setIdAuthor] = useState<number>(-1)
    const router: NextRouter = useRouter()

    const {data: author, isLoading} = useGetAuthorInfoQuery(idAuthor, {skip: idAuthor < 0}) 
    
    useEffect(() => setIdAuthor(parseInt(router.query.creature_id as string ?? '-1')), [router.isReady])
    
    const { data: authorByPrnd } = useGetAuthorByPrndQuery(idAuthor, { skip: idAuthor < 0 });
    const authorIsandId = authorByPrnd ? authorByPrnd[0]?.author_isand_id : null;
    const {data: authorActivity } = useGetAuthorsActivityQuery(authorIsandId, {skip: authorIsandId < 0});
    const publicationsCount = authorActivity ? calculateAllCount(authorActivity) : null;
    const { data: authorJournals } = useGetAuthorJournalsQuery(authorIsandId, { skip: !authorIsandId });
    const { data: authorConferences } = useGetAuthorConferencesQuery(authorIsandId, { skip: !authorIsandId });
    const { data: authorByFio, isLoading: loadingByFio } = useGetAuthorByFioQuery<any>(author ? author.fio : "", { skip: !author });
    const isand_ids = authorByPrnd ? parseStringToArray(authorByPrnd[0].org_isand_ids) : !loadingByFio && authorByFio ? parseStringToArray(authorByFio[0].org_isand_ids) : [];
    const { ref, inView } = useInView();
    const [currentId, setCurrentId] = useState(0);
    const [allOrganisations, setallOrganisations] = useState<any[]>([]);
    const { data, error } = useGetOrgInfoQuery(isand_ids[currentId]);
    const { data: publications, isLoading: publicationsLoading } = useGetPublicationsByAuthorIdQuery(authorIsandId, { skip: authorIsandId < 0 });

    useEffect(() => {
        if (data && data.length > 0 && allOrganisations.length < isand_ids.length) {
            setallOrganisations(prev => [...prev, ...data]);
            setCurrentId(prev => prev + 1);
            
        }
    }, [data]);


    useEffect(() => {
        if (inView && !isLoading) {
            setCurrentId(prev => prev + 1);
        }
    }, [inView, isLoading]);
  
  
    const { data: authorPosts, isLoading: postsLoading } = useGetAuthorsPostsQuery({
      authors: [{ author_id: idAuthor.toString() }]
    }, { skip: idAuthor < 0 });


    if (isLoading || !author) {
        return <>
            <Head>
                <title>Профиль автора</title>
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
/*
    return (
        <>
            <Head>
                <title>Профиль автора</title>
            </Head>
            <Container>
                <Stack spacing={2} sx={{mt: '60px', justifyContent: 'center', width: '100%'}}>
                    <AuthorPersonHatCard author={{
                        a_fio: author.fio, 
                        a_aff_org_name: author.affiliation, 
                        avatar: author.avatar
                    }} />
                    <ScienceObjectReview 
                        idAuthor={idAuthor}
                        citations={author.citations} 
                        publications={publicationsCount || author.publications} 
                        description={author.description} 
                        geoposition={author.geoposition} 
                        ids={author.ids} 
                        objectType='authors'
                    />
                </Stack>
            </Container>
        </>
    );
    */

    const tabs = [
        { 
          label: "Обзор", component: <AuthorOverviewTab prndAuthor={author || authorByPrnd} matchingAuthorId={idAuthor} prndAuthorLoading={isLoading} /> 
        },
        { 
          label: "Публикации", 
          component: <PublicationsTab publications={publications || []} isLoading={publicationsLoading} /> 
        },
        { label: "Организации", component: <OrganisationsTab organisations={allOrganisations || []} isLoading={isLoading} /> },
        { label: "Журналы и конференции", component: <JournsConfsTab journals={authorJournals || []} conferences={authorConferences || []} isLoading={isLoading} /> },
        ];
    

    if (isLoading || !author) {
        return <>
            <Head>
                <title>Профиль автора</title>
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
                <title>Профиль автора</title>
            </Head>
            <Box sx={{ padding: 4, position: 'relative' }}> 
                <Container>
                <Stack spacing={2} sx={{ mt: "60px", justifyContent: "center", width: "100%" }}>
                    {!isLoading && author && (
                    <>
                        <AuthorPersonHatCard
                        author={{
                            a_fio: author.fio || authorByPrnd[0].author_fio,
                            a_aff_org_name: author.affiliation,
                            avatar: author.avatar,
                        }}
                        sx={{
                            '& .fio-text': { fontSize: '50px' },
                        }}
                        />
                    </>
                    )}
                </Stack>
                </Container>
                <Box sx={{ mt: 6 }}>
                <Container>
                    <TabsComponent tabs={tabs} fontSize={25} />
                </Container>
                </Box>

            </Box>
        </>
    )

} 

export default AuthorPage;