import React from "react";
import { Container, Stack, Typography } from "@mui/material";
import Head from "next/head";

const tmpPage: React.FC = (): React.ReactElement => {

    return (
        <>
            <Container>
                <Typography variant='h5'>{`Авторы`}</Typography>
            </Container>
        </>
    );
} 

export default tmpPage;