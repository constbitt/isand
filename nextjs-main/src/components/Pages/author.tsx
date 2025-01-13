import React, { useEffect, useState } from 'react'
import {Box, CircularProgress, Container, Stack} from "@mui/material"
import Head from 'next/head';
import AuthorPersonHatCard from '@/src/components/Cards/AuthorPersonHat';
import { useGetAuthorInfoQuery } from '@/src/store/api/serverApiV3';
import { NextRouter, useRouter } from 'next/router';
import ScienceObjectReview from '@/src/components/CenterContainer/ScienceObjectReview';


const AuthorPage: React.FC = (): React.ReactElement => {
    const [idAuthor, setIdAuthor] = useState<number>(-1)
    const router: NextRouter = useRouter()

    const {data, isLoading} = useGetAuthorInfoQuery(idAuthor, {skip: idAuthor < 0}) 
    
    useEffect(() => setIdAuthor(parseInt(router.query.creature_id as string ?? '-1')), [router.isReady])

    if (isLoading || !data) {
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
            <Container>
                <Stack spacing={2} sx={{mt: '60px', justifyContent: 'center', width: '100%'}}>
                    <AuthorPersonHatCard author={{
                        a_fio: data.fio, 
                        a_aff_org_name: data.affiliation, 
                        avatar: data.avatar
                    }} />
                    <ScienceObjectReview 
                        idAuthor={idAuthor}
                        citations={data.citations} 
                        publications={data.publications} 
                        description={data.description} 
                        geoposition={data.geoposition} 
                        ids={data.ids} 
                        objectType='authors'
                    />
                </Stack>
            </Container>
        </>
    );
} 

export default AuthorPage;