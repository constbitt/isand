import AllPersonHat from "@/src/components/Cards/AllPersonHat";
import RadarComponent from "@/src/components/Chart/RadarChart/Radarchart";
import TabsComponent from "@/src/components/Tabs/TabsComponent";
import { Container, Stack, Typography } from "@mui/material";
import Head from "next/head";
import React from "react";

interface Organization {
    avatar: string
    name: string
    geoposition?: string
}

const data: Organization = {
    avatar: '',
    geoposition: 'Москва, Россия',
    name: 'Институт проблем управления им. В. А. Трапезникова РАН' 
}

const tabs: {label: string, component: React.ReactNode}[] = [
    // { label: 'Метафакторы', component: <RadarComponent level={0} id={[]} include_common_terms={0} object_type={""} /> },
    { label: 'Факторы', component: <RadarComponent level={1} id={[]} include_common_terms={0} object_type={""} /> },
    { label: 'Подфакторы', component: <RadarComponent level={2} id={[]} include_common_terms={0} object_type={""} /> },
    { label: 'Термины', component: <RadarComponent level={3} id={[]} include_common_terms={0} object_type={""} /> },
]

const OrganizationReview: React.FC = (): React.ReactElement => {
    return (
        <Stack sx={{width: '100%', pt: '40px'}}>
            <TabsComponent tabs={tabs} />
        </Stack>
    )
}

const OrganizationPage: React.FC = (): React.ReactElement => {
    // const id_publ = useTypedSelector(selectIdPubl)
    // const {data, error, isLoading} = useGetSearchApiPageQuery(id_publ) 
    
    // if (isLoading) {
    //     return (
    //         <Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    //             <CircularProgress />
    //         </Stack>
    //     );
    // }
    
    // if (!data) {
    //     return <div>No data found.</div>;
    // }

    return (
        <>
            <Head>
                <title>Профиль организации</title>
            </Head>
            <Container>
                <Stack spacing={2} sx={{mt: '60px', justifyContent: 'center'}}>
                    <AllPersonHat name={data.name} avatar={data.avatar} geoposition={data.geoposition} />
                    <OrganizationReview />
                </Stack>
            </Container>
        </>
    );
} 

export default OrganizationPage;