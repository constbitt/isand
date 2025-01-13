import React, { useEffect, useState } from 'react';
import { Button, CircularProgress, Container, Stack, Typography } from '@mui/material';
import Head from 'next/head';
import { useGetAccountApiModeratePagesQuery } from '@/src/store/api/serverApiV6';
import PersonalityForm from '@/src/components/Forms/PersonalityForm';
import OrgForm from '@/src/components/Forms/OrgForm';

interface NavigationButtonProps {
    children?: React.ReactNode;
    active: boolean;
    onClick: () => void;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({ children, active, onClick }) => (
    <Button
        onClick={onClick}
        sx={{
            border: 'none',
            color: 'black',
            fontSize: 16,
        }}
        style={{
            backgroundColor: active ? 'rgba(215, 232, 255, 1)' : 'white',
        }}
    >
        {children}
    </Button>
);

const PersonalitySetting: React.FC = () => {
    const { data: moderatePages, isLoading: isModeratePagesLoading } = useGetAccountApiModeratePagesQuery();
    
    const [navActive, setNavActive] = useState<boolean[]>([]);

    useEffect(() => {
        setNavActive([true, ...(moderatePages?.org_names?.map(() => false) ?? [])]);
    }, [moderatePages]);

    const renderActiveForm = () => {
        const activeIndex = navActive.findIndex(active => active);
        if (activeIndex === 0) {
            return <PersonalityForm />;
        } else if (activeIndex > 0 && moderatePages?.org_names && activeIndex - 1 < moderatePages.org_names.length) {
            const org_id = moderatePages.org_names[activeIndex - 1].id
            return <OrgForm org_id={org_id} />;
        }
    };

    if (isModeratePagesLoading) {
        return (
            <>
                <Head>
                    <title>Изменение страниц</title>
                </Head>
                <Container sx={{height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <CircularProgress />
                </Container>
            </>
        );
    }

    return (
        <>
            <Head>
                <title>Изменение страниц</title>
            </Head>
            <Container>
                <Typography mt={2} color="primary" variant="h5">
                    Доступные страницы
                </Typography>
                <Stack direction="row" mt={2} justifyContent="space-between">
                    <Stack spacing={2} sx={{ width: '30%' }}>
                        {moderatePages?.fio && (
                            <NavigationButton
                                active={navActive[0]}
                                onClick={() => setNavActive([true, ...(moderatePages?.org_names?.map(() => false) ?? [])])}
                            >
                                {moderatePages.fio}
                            </NavigationButton>
                        )}
                        {moderatePages?.org_names?.map((item, id) => (
                            <NavigationButton
                                key={id}
                                active={navActive[id + 1]}
                                onClick={() =>
                                    setNavActive(
                                        [false, ...(moderatePages?.org_names?.map((_, index) => index + 1 === id + 1) ?? [])]
                                    )
                                }
                            >
                                {item.name}
                            </NavigationButton>
                        ))}
                    </Stack>
                    {renderActiveForm()}
                </Stack>
            </Container>
        </>
    );
};

export default PersonalitySetting;