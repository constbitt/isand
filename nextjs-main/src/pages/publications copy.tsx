// @ts-nocheck

import React, { useEffect, useState } from "react";
import { Stack, Typography, Box, Card, CircularProgress } from "@mui/material";
import { useGetPublIsandInfoQuery, useSearchPublicationsQuery, useGetPublCardInfoQuery } from "@/src/store/api/serverApiV2_5";
import { useInView } from "react-intersection-observer";
import StyledContainedButton from "@/src/components/Buttons/StyledContainedButton";
import Link from 'next/link';

const PublicationsPage = () => {
    const [currentId, setCurrentId] = useState(1);
    const [allPublications, setAllPublications] = useState<Publication[]>([]);
    const { ref, inView } = useInView();

    const { data, error, isLoading } = useGetPublIsandInfoQuery(currentId);
    const [searchText, setSearchText] = useState('');
    const [isSearching, setIsSearching] = useState(false); 

    const { data: searchResults } = useSearchPublicationsQuery(
        { type: "статья,доклад,Глава в книге,глава,книга,пленарный доклад, препринт, тезисы", all_text: searchText },
        { skip: !isSearching }
    );
    
    const [showResults, setShowResults] = useState(false);

    const handleSearch = () => {
        setIsSearching(true);
        setShowResults(true);
    };

    useEffect(() => {
        setShowResults(false);
    }, [searchText]);

    useEffect(() => {
        if (searchResults) {
            setIsSearching(false);
        }
    }, [searchResults]);

    useEffect(() => {
        if (data && data.length > 0) {
            setAllPublications(prev => [...prev, ...data]);
            setCurrentId(prev => prev + 1);
        }
    }, [data]);

    useEffect(() => {
        if (inView && !isLoading) {
            setCurrentId(prev => prev + 1);
        }
    }, [inView, isLoading]);

    const handleHref = (creatureId: number) => {
        return `/publications/publication?creature_id=${creatureId}`;
    };

    if (error) return <Typography color="error"></Typography>;

    return (
        <Stack sx={{ height: "100%" }} mt={2} spacing={3}>
            <Stack sx={{ width: "90%", alignSelf: "center" }} spacing={3}>
                <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
                    <Box sx={{ flexGrow: 1 }}>
                        <input
                            type="text"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder="Поиск по ключевым словам публикаций"
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                            }}
                        />
                    </Box>
                    <StyledContainedButton 
                        variant="contained"
                        onClick={handleSearch} 
                    >
                        Найти
                    </StyledContainedButton>
                </Stack>

                {isSearching && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <CircularProgress />
                    </Box>
                )}

                <Stack spacing={3}>
                    {searchText !== '' && searchResults && !isSearching && showResults && (
                        <>
                            {searchResults.map((publication) => (
                                <Card key={publication.publ_isand_id} sx={{ m: 0, boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)', alignItems: 'center', padding: '16px' }}>
                                    <Typography variant="h6">{publication.publ_name}</Typography>
                                    <Typography variant="body2">Авторы: {publication.author_fios}</Typography>
                                    <Typography variant="body2">Год: {publication.year}</Typography>
                                    <Typography variant="body2">Источник: {publication.ext_source}</Typography>
                                </Card>
                            ))}
                        </> 
                    )}
                </Stack>


                <Stack spacing={3}>
                    {searchText === '' && (
                        <>
                            {allPublications.map((publication) => (
                                    <Card key={publication.publ_isand_id} sx={{ m: 0, boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)', alignItems: 'center', padding: '16px' }}>
                                        <Typography variant="h6">{publication.publ_name}</Typography>
                                        <Typography variant="body2">Авторы: {publication.author_fios}</Typography>
                                        <Typography variant="body2">Год: {publication.year}</Typography>
                                        <Typography variant="body2">Источник: {publication.ext_source}</Typography>
                                    </Card>

                            ))}

                            <Box ref={ref} sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                {isLoading && <CircularProgress />}
                            </Box>
                        </>
                    )}
                </Stack>
            </Stack>
        </Stack>
    );
};

export default PublicationsPage;
