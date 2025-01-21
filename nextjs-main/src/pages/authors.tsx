// @ts-nocheck

import { getAuthors, getRunningQueriesThunk as apiV1GetRunningQueriesThunk } from "@/src/store/api/serverApi";
import { wrapper } from "@/src/store/store";
import { getOrganization, getRunningQueriesThunk as apiV2GetRunningQueriesThunk } from "@/src/store/api/serverApiV2";
import React, { useState, useEffect } from "react";
import { Stack, Typography, Box, Card } from "@mui/material";
import Select from "react-select";
import { ApiResponse } from "@/src/store/types/apiTypes";
import { Author } from "@/src/store/types/authorTypes";
import { Laboratory } from "@/src/store/types/laboratoryTypes";
import Head from "next/head";
import StyledAvatar from '@/src/components/Avatar/StyledAvatar';
import Link from 'next/link';
import StyledContainedButton from "@/src/components/Buttons/StyledContainedButton";

const AuthorCard = ({ author }: { author: Author }) => {
    return (
        <Card key={author.id} sx={{ m: 0, boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)', display: 'flex', alignItems: 'center', padding: '16px' }}>
            <StyledAvatar 
                fio={author.value} 
                width={100}
                height={100}
                url={author.avatarUrl || ''}
                editable={false}
            />
            <Typography variant="h6" sx={{ marginLeft: '16px', fontSize: '2.0rem' }}>{author.value}</Typography>
        </Card>
    );
};

export default function AuthorsResultPage({
    authorsResponse,
    laboratoriesResponse
}: {
    authorsResponse: ApiResponse<Author[]>,
    laboratoriesResponse: ApiResponse<Laboratory[]>
}) {
    const [selectedAuthors, setSelectedAuthors] = useState<Author[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");

    const { data: authors, error: authorsError } = authorsResponse;

    const handleHref = (creatureId: number) => {
        return `/authors/author?creature_id=${creatureId}`;
      };

    if (!authors) {
        return <div>{"Some error occurred..."}</div>;
    }

    const filteredAuthors = authors.filter(author =>
        author.value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const customStyles = {
        control: (base: any) => ({
            ...base,
            borderRadius: '7px',
            padding: '4px',
        }),
        multiValue: (base: any) => ({
            ...base,
            backgroundColor: '#e4e4e4',
            borderRadius: '4px',
        }),
        multiValueLabel: (base: any) => ({
            ...base,
            color: '#000',
        }),
    };
    const handleSearch = () => {

    };

    const getOptionLabel = (option: any) => option.name || option.label || option.value || "Unknown";
    const getOptionValue = (option: any) => option.id || option.value;

    return (
        <>
            <Stack sx={{ height: "100%" }} mt={2} spacing={3}>
                <Stack sx={{ width: "90%", alignSelf: "center" }} spacing={3}>
                    <Stack direction={"row"} spacing={1} sx={{ justifyContent: "center" }}>
                        <Box sx={{ width: "100%" }} role="presentation">
                            <Stack sx={{ width: "100%"}} spacing={2.7}>
                                <input
                                    type="text"
                                    placeholder="Введите ФИО автора"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            </Stack>
                        </Box>
                        <StyledContainedButton 
                            variant="contained"
                            onClick={handleSearch} 
                        >
                            Найти
                        </StyledContainedButton>
                    </Stack>
                    <Stack spacing={3}>
                        {filteredAuthors.map((author) => (
                            <Link key={author.id} href={handleHref(author.id)}>
                                <AuthorCard author={author} />
                            </Link>
                        ))}
                    </Stack>
                </Stack>
            </Stack>
        </>
    );
}

export const getServerSideProps = wrapper.getServerSideProps(
    (store) => async () => {
        const authorsResponse = await store.dispatch(getAuthors.initiate());
        const laboratoriesResponse = await store.dispatch(getOrganization.initiate());

        await Promise.all(store.dispatch(apiV2GetRunningQueriesThunk()));
        await Promise.all(store.dispatch(apiV1GetRunningQueriesThunk()));

        return {
            props: {
                authorsResponse,
                laboratoriesResponse
            },
        };
    }
);