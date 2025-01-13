import { Box, Button, CircularProgress, Container, Stack, TextField } from "@mui/material";
import Head from "next/head";
import React, { useState } from "react";
import AuthorPersonHatCard from "../components/Cards/AuthorPersonHat";
import TabsComponent from "../components/Tabs/TabsComponent";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useGetAccountApiPersonHatQuery } from "../store/api/serverApiV6";
import Link from "next/link";
import ScienceObjectReview from "../components/CenterContainer/ScienceObjectReview";


interface IProfileAnnotation {
    lastname: string
    name: string
    org_name: string
    status: string
}

const AcceptPubls: React.FC = () => {
    const [phrase, setPhrase] = useState<string>('')
    
    return (
        <Stack spacing={4} mt={4} width={'100%'}>
            <Link href={'personality/upload'}>
                <Button type="submit" variant="contained" style={{ backgroundColor: '#1B4596'}}>Загрузить публикации</Button>
            </Link>
            <Stack spacing={2} width={'100%'} direction={'row'}>
                <TextField 
                    sx={{ flexGrow: 1 }}
                    value={phrase} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhrase(e.target.value)}
                    label="Введите запрос" 
                    variant="outlined"
                />
                <Button type="submit" variant="contained" style={{ backgroundColor: '#1B4596'}}>Найти</Button>
            </Stack>
        </Stack>
    )
}

const ProbablyPubls: React.FC = () => {
    return <></>
}


const PersonPubls: React.FC = (): React.ReactElement => {
    const publ_tabs: {label: string, component: React.ReactNode}[] = [
        {label: 'Подтвержденные публикации', component: <AcceptPubls />}, 
        {label: 'Возможные публикации', component: <ProbablyPubls />},
    ]

    return (
        <Stack direction={'row'} sx={{mt: '32px', width: '100%', alignItems: 'center', position: 'relative'}} spacing={0.5}>
            <TabsComponent tabs={publ_tabs} variant="standard" hatWidth="40%" />
            {/* <HelpOutlineIcon sx={{position: 'absolute', top: 5, right: -4}} color="primary" /> */}
        </Stack>
    )
}

const PersonPage = (): React.ReactElement => {
    const {data: hatData, isLoading} = useGetAccountApiPersonHatQuery()
    const p_tabs: {label: string, component: React.ReactNode}[] = [
        {label: 'Обзор', component: <ScienceObjectReview idAuthor={-1} citations={0} description="" geoposition="" ids={[]} publications={0} objectType="authors" />}, 
        {label: 'Публикации', component: <PersonPubls />}, 
        {label: 'Организация', component: <></>}, 
        {label: 'Журналы и конференции', component: <></>},
    ]

    if (isLoading) {
        return (
            <>
                <Head><title>Личная страница</title></Head>
                <Container sx={{width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <CircularProgress />
                </Container>
            </>
        )
    }

    return (
    <>
        <Head><title>Личная страница</title></Head>
        <Container sx={{mt: '20px', display: 'flex', justifyContent: 'center'}}>
            <Stack spacing={8} sx={{width: '90%', alignItems: 'center'}}>
                <Stack sx={{width: '70%', alignItems: 'flex-start'}}>
                    <AuthorPersonHatCard author={{
                            a_fio: hatData?.fio ?? '', 
                            a_aff_org_name: hatData?.affiliations ?? '', 
                            avatar: '',
                            representative: !!hatData?.representative,
                    }} />
                </Stack>
                <Stack sx={{width: '100%'}}>
                    <TabsComponent tabs={p_tabs} variant="standard" hatWidth="80%" fontSize={22} />
                </Stack>
            </Stack>
        </Container>
    </>    
    );
}
export default PersonPage;