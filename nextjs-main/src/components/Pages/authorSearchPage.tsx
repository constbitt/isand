// @ts-nocheck
import React, { useEffect, useState } from 'react'
import Head from 'next/head';
import AuthorPersonHatCard from '@/src/components/Cards/AuthorPersonHat';
import { NextRouter, useRouter } from 'next/router';
import { Box, Typography, Container, Stack, IconButton, MenuItem, CircularProgress, Card } from "@mui/material";
import TabsComponent from "@/src/components/Tabs/TabsComponent";
import { useGetAuthorInfoQuery } from '@/src/store/api/serverApiV3';
import { getAuthors, useGetAuthorsPostsQuery } from "@/src/store/api/serverApi";
import { useGetAuthorJournalsQuery, useGetAuthorConferencesQuery, useGetAuthorByPrndQuery, useGetOrgInfoQuery, useGetAuthorByFioQuery } from "@/src/store/api/serverApiV2_5";
import AuthorTabContent from '@/src/components/CenterContainer/AuthorTabContent';
import { parseStringToArray } from '@/src/tools/parseStringToArray';
import { useInView } from "react-intersection-observer";
import { wrapper } from '@/src/store/store';
import { Author } from '@/src/store/types/authorTypes';
import { ApiResponse } from '@/src/store/types/apiTypes';

const AuthorSearchPage: React.FC<{ authorsResponse: ApiResponse<Author[]> }> = ({ authorsResponse }) => {
    const [idAuthor, setIdAuthor] = useState<number>(-1)
    const router: NextRouter = useRouter()
    
    const getQueryParameter = (url: string, parameter: string) => {
        const urlParams = new URLSearchParams(url);
        return urlParams.get(parameter);
    };
    
    const { data: authors, error: authorsError } = authorsResponse;
    const authorFio = typeof window !== 'undefined' ? getQueryParameter(window.location.href, "author_fio") || "" : "";
    useEffect(() => {
        
        if (authors && authorFio) {
            const foundAuthor = authors.find((author) => author.value === authorFio);
            setIdAuthor(parseInt(foundAuthor?.id as string ?? '-1'));
        } else {
            setIdAuthor(parseInt(router.query.creature_id as string ?? '-1'));
        }
    }, [authors, router.isReady, router.query.creature_id]);

    
    const { data: authorByFio, isLoading: loadingByFio } = useGetAuthorByFioQuery<any>(authorFio || "");
    const { data: author, isLoading } = useGetAuthorInfoQuery(idAuthor, { skip: idAuthor < 0 });
    const { data: authorByPrnd } = useGetAuthorByPrndQuery(idAuthor, { skip: idAuthor < 0 });
    

    const authorIsandId = idAuthor < 0 && !loadingByFio && authorByFio ? authorByFio[0].author_isand_id : authorByPrnd ? authorByPrnd[0].author_isand_id : null;
    const { data: authorJournals } = useGetAuthorJournalsQuery(authorIsandId, { skip: !authorIsandId });
    const { data: authorConferences } = useGetAuthorConferencesQuery(authorIsandId, { skip: !authorIsandId });
    const isand_ids = authorByPrnd ? parseStringToArray(authorByPrnd[0].org_isand_ids) : !loadingByFio && authorByFio ? parseStringToArray(authorByFio[0].org_isand_ids) : [];
    const { ref, inView } = useInView();
    const [currentId, setCurrentId] = useState(0);
    const [allOrganisations, setallOrganisations] = useState<any[]>([]);
    const { data, error } = useGetOrgInfoQuery(isand_ids[currentId]);
    useEffect(() => {
        if (data && data.length > 0) {
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
  
    const tabs = [
        { label: "Обзор", component: <AuthorTabContent index={0} author={author} isLoading={isLoading} authorPosts={authorPosts} postsLoading={postsLoading} authorJournals={authorJournals} authorConferences={authorConferences} idAuthor={idAuthor} allOrganisations={allOrganisations} /> },
        { label: "Публикации", component: <AuthorTabContent index={1} author={author} isLoading={isLoading} authorPosts={authorPosts} postsLoading={postsLoading} authorJournals={authorJournals} authorConferences={authorConferences} idAuthor={idAuthor} allOrganisations={allOrganisations} /> },
        { label: "Организации", component: <AuthorTabContent index={2} author={author} isLoading={isLoading} authorPosts={authorPosts} postsLoading={postsLoading} authorJournals={authorJournals} authorConferences={authorConferences} idAuthor={idAuthor} allOrganisations={allOrganisations} /> },
        { label: "Журналы и конференции", component: <AuthorTabContent index={3} author={author} isLoading={isLoading} authorPosts={authorPosts} postsLoading={postsLoading} authorJournals={authorJournals} authorConferences={authorConferences} idAuthor={idAuthor} allOrganisations={allOrganisations} /> },
      ];
    
      if (!loadingByFio && authorByFio && idAuthor < 0 ) {
        return (
            <>
                <Head>
                    <title>Профиль автора</title>
                </Head>
                <Box sx={{ padding: 4, position: 'relative' }}> 
                    <Container>
                    <Stack spacing={2} sx={{ mt: "60px", justifyContent: "center", width: "100%" }}>
                        {!loadingByFio && authorByFio && (
                        <>
                            <AuthorPersonHatCard
                            author={{
                                a_fio: authorByFio[0].author_fio,
                                a_aff_org_name: authorByFio[0].org_isand_ids,
                                avatar: authorByFio[0].avatar,
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
                            a_fio: author.fio,
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



export const getServerSideProps = wrapper.getServerSideProps(
    (store) => async () => {
      await store.dispatch(getAuthors.initiate());
      const authorsResponse = getAuthors.select()(store.getState());
  
      return {
        props: {
          authorsResponse,
        },
      };
    }
  );
  
export default AuthorSearchPage;