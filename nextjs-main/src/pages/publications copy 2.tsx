// @ts-nocheck

import { getAuthors, getRunningQueriesThunk as apiV1GetRunningQueriesThunk } from "@/src/store/api/serverApi";
import { wrapper } from "@/src/store/store";
import { getOrganization, getRunningQueriesThunk as apiV2GetRunningQueriesThunk } from "@/src/store/api/serverApiV2";
import React, { useState, useEffect } from "react";
import { Stack, Typography, Box, Card, CircularProgress, Button } from "@mui/material";
import { useInView } from 'react-intersection-observer';
import { useGetPublInfoQuery, useGetPublIsandInfoQuery } from "@/src/store/api/serverApiV2_5";
import { useSearchPublicationsQuery } from "@/src/store/api/serverApiV2_5";
import StyledContainedButton from "@/src/components/Buttons/StyledContainedButton";

export default function PublicationsPage() {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [searchType, setSearchType] = useState<string>("статья,доклад");
    const [triggerSearch, setTriggerSearch] = useState<boolean>(false);
    const [displayedPublications, setDisplayedPublications] = useState(null);
    const [isSearching, setIsSearching] = useState<boolean>(false);

    const { data: publications, isLoading } = useSearchPublicationsQuery(
        { type: searchType, all_text: searchTerm },
        {
            skip: !triggerSearch
        }
    );

    

    useEffect(() => {
        if (publications) {
            setDisplayedPublications(publications);
            setIsSearching(false);
        }
    }, [publications]);

    const handleSearch = () => {
        setDisplayedPublications(null);
        setIsSearching(true);
        setTriggerSearch(true);
    };

    if (isLoading) {
        return(
            <Stack sx={{ height: "100%" }} mt={2} spacing={3}>
            <Stack sx={{ width: "90%", alignSelf: "center" }} spacing={3}>
                <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
                    <Box sx={{ flexGrow: 1 }}>
                        <input
                            type="text"
                            placeholder="Поиск по ключевым словам публикаций"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </Box>
                    <StyledContainedButton 
                        variant="contained" 
                        onClick={handleSearch} 
                    >
                        Найти
                    </StyledContainedButton>
                </Stack>
                <CircularProgress />
            </Stack>
        </Stack>

        );
    }

    return (
        <Stack sx={{ height: "100%" }} mt={2} spacing={3}>
            <Stack sx={{ width: "90%", alignSelf: "center" }} spacing={3}>
                <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
                    <Box sx={{ flexGrow: 1 }}>
                        <input
                            type="text"
                            placeholder="Поиск по ключевым словам публикаций"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </Box>
                    <StyledContainedButton 
                        variant="contained" 
                        onClick={handleSearch} 
                    >
                        Найти
                    </StyledContainedButton>
                </Stack>
                {isSearching && <CircularProgress sx={{ alignSelf: "left" }} />}
                
                {displayedPublications && displayedPublications.map((pub) => (
                    <Card key={pub.publ_isand_id} sx={{ m: 0, boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)', padding: '16px' }}>
                        <Stack spacing={1}>
                            <Typography variant="body1">{pub.publ_name || 'Название отсутствует'}</Typography>
                            <Typography variant="body2" sx={{ color: 'gray' }}>{pub.author_fios}</Typography>
                        </Stack>
                    </Card>
                ))}
            </Stack>
        </Stack>
    );
}