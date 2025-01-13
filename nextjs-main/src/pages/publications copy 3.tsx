// @ts-nocheck

import React, { useState, useEffect } from "react";
import { Stack, Typography, Box, Card, CircularProgress } from "@mui/material";
import { useInView } from "react-intersection-observer";
import { useGetPublIsandInfoQuery } from "@/src/store/api/serverApiV2_5";

export default function PublicationsPage() {
    const [counter, setCounter] = useState(1);
    const [publications, setPublications] = useState([]);
    const { ref, inView } = useInView({ threshold: 0.1 });
    const { data: newPublications, isFetching } = useGetPublIsandInfoQuery(counter);

    useEffect(() => {
        if (newPublications) {

            const uniquePublications = newPublications.filter(
                (newPub) => !publications.some((existingPub) => existingPub.publ_name === newPub.publ_name)
            );
            
            setPublications((prev) => [
                ...prev,
                ...uniquePublications
            ]);
        }
    }, [newPublications]);
    

    
    useEffect(() => {
        if (inView && !isFetching) {
            setCounter((prev) => prev + 1);
        }
    }, [inView, isFetching]);

    return (
        <Stack spacing={2}>
            {publications.map((pub) => (
                <Card key={pub.id}>
                    <Typography variant="h6">{pub.publ_name}</Typography>
                    <Typography variant="body2">{pub.author_fios}</Typography>
                    <Typography variant="body2">{pub.year}</Typography>
                </Card>
            ))}
            <Box ref={ref} display="flex" justifyContent="center" alignItems="center" padding={2}>
                {isFetching && <CircularProgress />}
            </Box>
        </Stack>
    );
}
