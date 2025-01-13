import React, { useEffect, useState } from 'react';
import { useGetPublInfoQuery } from '@/src/store/api/serverApiV3';
import { Typography, Container, Stack, CircularProgress, Box } from "@mui/material";
import RadarComponent from '@/src/components/Chart/RadarChart/Radarchart';
import TabsComponent from '@/src/components/Tabs/TabsComponent';
import Head from 'next/head';
import { NextRouter, useRouter } from 'next/router';
import AuthorCard from '../Cards/AuthorCard';
import Link from 'next/link';


const PublicationPage: React.FC = (): React.ReactElement => {
    const [idPubl, setIdPubl] = useState<number>(-1);
    const [scroll, setScroll] = useState<boolean>(false);

    const router: NextRouter = useRouter();
    const { data, isLoading } = useGetPublInfoQuery(idPubl, { skip: idPubl < 0 });
    

    
    useEffect(() => {
        if (router.isReady) {
            const id = parseInt(router.query.creature_id as string ?? '-1');
            setIdPubl(id);
            if (id > 0) {
                localStorage.setItem('lastPublicationId', id.toString());
            }
        }
    }, [router.isReady, router.query.creature_id]);

    useEffect(() => {
        data?.authors.length > 3 && setScroll(true);
    }, [data]);

    useEffect(() => {
        if (router.query.author_fio) {
            const { author_fio, ...restQuery } = router.query;
            const savedPublicationId = localStorage.getItem('lastPublicationId');
            
            router.push({
                pathname: router.pathname,
                query: {
                    ...restQuery,
                    creature_id: savedPublicationId || router.query.creature_id
                }
            }, undefined, { shallow: false });
        }
    }, [router.query]);
    

    const tabs: { label: string, component: React.ReactNode }[] = [
        { label: 'Факторы', component: <RadarComponent level={1} id={[idPubl]} include_common_terms={0} object_type='publications' /> },
        { label: 'Подфакторы', component: <RadarComponent level={2} id={[idPubl]} include_common_terms={0} object_type='publications' /> },
        { label: 'Термины', component: <RadarComponent level={3} id={[idPubl]} include_common_terms={0} object_type='publications' /> },
    ];

    if (isLoading || !data) {
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

    return (
        <>
            <Head>
                <title>Профиль публикации</title>
            </Head>
            <Container>
                <Stack spacing={2}>
                    <Typography variant='h3' textAlign={'center'}>{data.p_title}</Typography>
                    <Stack direction={'row'} sx={{ mt: 2, justifyContent: 'space-between' }} spacing={2}>
                        <Stack spacing={2} sx={{ width: '60%', minWidth: '700px' }}>
                            <Typography variant='h5'>Аннотация</Typography>
                            <Typography>{data.p_annotation || '{ У публикации не найдена аннотация }'}</Typography>
                            <TabsComponent tabs={tabs} variant='fullWidth' />
                        </Stack>
                        <Stack sx={{ width: '35%', minWidth: '200px' }} spacing={2}>
                            <Typography variant='h5'>{`Авторы (${data.authors?.length ?? 0})`}</Typography>
                            <Stack sx={{ maxHeight: '400px', overflowY: scroll ? 'scroll' : undefined }} spacing={1} py={0.5}>
                                {data.authors?.map((author: { a_fio: string, a_aff_org_name: string[] }, index: number) => {
                                    return (
                                        <Link
                                            key={index}
                                            href={{
                                                pathname: `/deepSearch/dResult/publication/author`,

                                                query: { ...router.query, author_fio: author.a_fio }
                                            }}
                                            passHref
                                        >
                                            <AuthorCard author={author} />
                                        </Link>
                                    );
                                })}
                                {!data.authors && <Typography>{'{ У публикации не найдены авторы }'}</Typography>}
                            </Stack>
                        </Stack>
                    </Stack>
                </Stack>
            </Container>
        </>
    );
};

export default PublicationPage;
