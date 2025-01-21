/*
import PublicationPage from "@/src/components/Pages/publication";

export default PublicationPage;*/
// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useGetPublInfoQuery } from '@/src/store/api/serverApiV3';
import { useGetPublCardInfoQuery, useGetPublIsandInfoQuery } from '@/src/store/api/serverApiV2_5';
import { Typography, Container, Stack, CircularProgress, Box } from "@mui/material";
import RadarComponent from '@/src/components/Chart/RadarChart/Radarchart';
import TabsComponent from '@/src/components/Tabs/TabsComponent';
import Head from 'next/head';
import { NextRouter, useRouter } from 'next/router';
import AuthorCard from '@/src/components/Cards/AuthorCard';
import Link from 'next/link';


const PublicationPage: React.FC = (): React.ReactElement => {
    const [idPubl, setIdPubl] = useState<number>(-1);
    const [scroll, setScroll] = useState<boolean>(false);

    const router: NextRouter = useRouter();
    //const { data, isLoading } = useGetPublInfoQuery(idPubl, { skip: idPubl < 0 });
    const { data, isLoading } = useGetPublCardInfoQuery(idPubl, { skip: idPubl < 0 });
    const { data: publ, isLoading: isLoadingPublication } = useGetPublIsandInfoQuery(idPubl, { skip: idPubl < 0 });
    
    useEffect(() => {
        if (router.isReady) {
            if (!router.query.creature_id) {
                const savedPublicationId = localStorage.getItem('lastPublicationId');
                if (savedPublicationId) {
                    router.push({
                        pathname: router.pathname,
                        query: { creature_id: savedPublicationId }
                    }, undefined, { shallow: true });
                }
            }

            const id = parseInt(router.query.creature_id as string ?? '-1');
            setIdPubl(id);
            if (id > 0) {
                localStorage.setItem('lastPublicationId', id.toString());
            }
        }
    }, [router.isReady, router.query.creature_id]);

    const [authorsList, setAuthorsList] = useState<{ author_fio: string; author_isand_id: string }[]>([]);

    useEffect(() => {
        if (data && data.length > 0) {
            const authorsFios = publ[0].author_fios.split(';').map(fio => fio.trim());
            const authorsIds = publ[0].author_isand_ids.split(';').map(id => id.trim());
            setAuthorsList(authorsFios.map((fio, index) => ({
                author_fio: fio,
                author_isand_id: authorsIds[index]
            })));
        }
        
    }, [publ]);

/*
    useEffect(() => {
        data?.authors.length > 3 && setScroll(true);
    }, [data]);
    
    /*
    const tabs: { label: string, component: React.ReactNode }[] = [
        { label: 'Факторы', component: <RadarComponent level={1} id={[idPubl]} include_common_terms={0} object_type='publications' /> },
        { label: 'Подфакторы', component: <RadarComponent level={2} id={[idPubl]} include_common_terms={0} object_type='publications' /> },
        { label: 'Термины', component: <RadarComponent level={3} id={[idPubl]} include_common_terms={0} object_type='publications' /> },
    ];
    */

    if (isLoading || !data || data.length === 0 || !publ || publ.length === 0) {
        return (
            <>
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
        );
    }

    const publication = data[0];
    const isand_publ = publ[0];


    return (
        <>
            <Head>
                <title>Профиль публикации</title>
            </Head>
            <Container>
                <Stack spacing={2}>
                    <Typography variant='h3' textAlign={'center'}>{publication.publ_name}</Typography>
                    <Stack direction={'row'} sx={{ mt: 2, justifyContent: 'space-between' }} spacing={2}>
                        <Stack spacing={2} sx={{ width: '60%', minWidth: '700px' }}>
                            <Typography variant='h5'>Аннотация</Typography>
                            <Typography>{(publication as any).annotation || '{ У публикации не найдена аннотация }'}</Typography>
                            {/*<TabsComponent tabs={tabs} variant='fullWidth' />*/}
                        </Stack>
                        <Stack sx={{ width: '35%', minWidth: '200px' }} spacing={2}>
                            <Typography variant='h5'>{`Авторы (${authorsList?.length ?? 0})`}</Typography>
                            <Stack sx={{ maxHeight: '400px', overflowY: scroll ? 'scroll' : undefined }} spacing={1} py={0.5}>
                                {authorsList.map((author, index) => {
                                    return (
                                        <Link
                                            key={index}
                                            href={{
                                                pathname: `/publications/isand_publ/author`,
                                                query: { ...router.query, author_fio: author.author_fio }
                                            }}
                                            passHref
                                        >
                                            <AuthorCard author={{ a_fio: author.author_fio, a_aff_org_name: [] }} />
                                        </Link>
                                    );
                                })}
                            </Stack>
                        </Stack>
                    </Stack>
                </Stack>
            </Container>
        </>
    );
};

export default PublicationPage;
