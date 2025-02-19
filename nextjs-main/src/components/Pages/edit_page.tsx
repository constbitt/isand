import React from 'react';
import { Box, Typography } from '@mui/material';
import Head from 'next/head';

const EditPageContent: React.FC = () => {
    return (
        <Box sx={{ padding: 2 }}>
            <Head>
                <title>Изменение страниц</title>
            </Head>
            <Typography variant="h4">Изменение страниц</Typography>
            <Typography variant="body1">Эта страница пока пуста.</Typography>
        </Box>
    );
};

export default EditPageContent;