import React, { useState, useEffect } from 'react';
import { usePostSearchApiSearchMutation } from "@/src/store/api/serverApiV3"
import { initialState } from '@/src/store/slices/searchApiSlice';
import {Typography, Stack, Container, CircularProgress, Box} from "@mui/material"
import Head from 'next/head';
import { MiniCard, SearchApiModel } from '@/src/store/types/searchApiType';
import InfiniteScroll from 'react-infinite-scroll-component';
import { NextRouter, useRouter } from 'next/router';
import UniversalCard from '@/src/components/Cards/UniversalCard';

const MemoizedUniversalCard = React.memo(UniversalCard);

const SearchResultPage: React.FC = (): React.ReactElement => {
    const [searchApiSearch] = usePostSearchApiSearchMutation();
    
    const [publs, setPubls] = useState<MiniCard[]>([]);
    const [totalHits, setTotalHits] = useState<number>(-1);
    const [offset, setOffset] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [searchField, setSearchField] = useState<string>('publications')

    const router: NextRouter = useRouter();

    const handleTotalName = (option: any) => {
        const fields: Record<string, string> = {
            'publications': 'публикаций',
            'journals': 'журналов',
            'geopositions': 'городов',
            'authors': 'авторов',
        };
        return fields[option]
    } 

    const loadMoreData = async (searchData: SearchApiModel) => {
        try {
            const result = await searchApiSearch({ ...searchData, offset: offset }).unwrap();
            setPubls(prevPubls => {
                const newPubls = [...prevPubls, ...result.hits];
                if (totalHits < 0) setTotalHits(result.total_hits);
                const newOffset = offset + result.hits.length;
                setOffset(newOffset);
                if (newOffset >= result.total_hits) {
                    setHasMore(false);
                }
                return newPubls;
            });
        } catch (error) {
            console.error(error);
        }
    };  

    useEffect(() => {
        if (router.isReady) {
            loadMoreData(router.query as unknown as SearchApiModel)
            setSearchField(router.query.search_field as string)
        }
    }, [router.isReady])

    return (
        <>
            <Head>
                <title>Результаты поиска</title>
            </Head>
            <Container>
                {totalHits > -1 &&  <Typography sx={{ width: '100%' }} variant='h5'>Всего {totalHits} {handleTotalName(JSON.parse(localStorage.getItem('search') ?? JSON.stringify(initialState)).search_field)}</Typography>}
                <InfiniteScroll
                    dataLength={publs.length}
                    next={() => {loadMoreData(router.query as unknown as SearchApiModel)}}
                    hasMore={hasMore}
                    loader={
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100px' }}>
                            <CircularProgress />
                        </Box>
                    }
                >
                    <Stack spacing={2} sx={{mt: 1}}>
                        {publs.map((publ, index) => <MemoizedUniversalCard key={index} type={searchField} creature={publ} searchType='search/sResult' />)}
                    </Stack>
                </InfiniteScroll>
            </Container>
        </>
    )
}

export default SearchResultPage;