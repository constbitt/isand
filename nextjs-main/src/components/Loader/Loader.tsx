import { CircularProgress, Stack } from '@mui/material';
import { blue } from '@mui/material/colors';
import { FC } from 'react';

export const Loader = () => {
    return (
        <Stack direction={'column'} alignItems="center" width={"100%"} height={"100%"} justifyContent={"center"}>
            <CircularProgress size={35} sx={{ color: blue[500] }} />
        </Stack>
    );
};