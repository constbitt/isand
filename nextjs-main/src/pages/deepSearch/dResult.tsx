import React, { useState, useEffect } from 'react';
import { usePostDeepSearchSearchMutation } from "@/src/store/api/serverApiV3";
import { Typography, Stack, Container, CircularProgress, Grid, Box } from "@mui/material";
import TabsComponent from '@/src/components/Tabs/TabsComponent';
import Head from 'next/head';
import { DeepSearchRequest, Hits, Phrases } from '@/src/store/types/deepSearchTypes';
import InfiniteScroll from 'react-infinite-scroll-component';
import { NextRouter, useRouter } from 'next/router';
import UniversalCard from '@/src/components/Cards/UniversalCard';

const Results: React.FC<{ name: string }> = ({ name }): React.ReactElement => {
    const [deepSearchSearch] = usePostDeepSearchSearchMutation();
    const [creatures, setCreatures] = useState<Hits[]>([]);
    const [totalHits, setTotalHits] = useState<number>(-1);
    const [offset, setOffset] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const router: NextRouter = useRouter();

    const handleArray = (name: string, data: Phrases[]) => {
        const fields: Record<string, Omit<Phrases, 'id'>[] | Omit<Phrases, 'name'>[]> = {
            'publications': data.map((item: Phrases) => ({ id: item.id, cut_off: item.cut_off })),
            'journals': data.map((item: Phrases) => ({ id: item.id, cut_off: item.cut_off })),
            'geopositions': data.map((item: Phrases) => ({ name: item.name, cut_off: item.cut_off })),
            'authors': data.map((item: Phrases) => ({ id: item.id, cut_off: item.cut_off })),
            'conferences': data.map((item: Phrases) => ({ id: item.id, cut_off: item.cut_off })),
            'organizations': data.map((item: Phrases) => ({ name: item.name, cut_off: item.cut_off })),
        };
        return fields[name];
    };

    const handleTotalName = (option: any) => {
        const fields: Record<string, string> = {
            'publications': 'публикаций',
            'journals': 'журналов',
            'geopositions': 'городов',
            'authors': 'авторов',
            'conferences': 'конференций',
            'organizations': 'организаций',
        };
        return fields[option];
    };

    const getSessionStorageKey = (request: Omit<DeepSearchRequest, 'offset' | 'search_field'>, name: string) => {
        return `d_${name}_${JSON.stringify(request)}`;
    };

    const loadMoreData = async (deepSearchRequest: Omit<DeepSearchRequest, 'offset' | 'search_field'>, name: string) => {
        const sessionKey = getSessionStorageKey(deepSearchRequest, name);
        
        try {
            const result = await deepSearchSearch({
                ...deepSearchRequest,
                search_field: name,
                offset: creatures.length,
                phrases: handleArray(name, deepSearchRequest.phrases as Phrases[])
            }).unwrap();
            setCreatures(prevCreatures => {
                const newCreatures = [...prevCreatures, ...result.hits];
                if (totalHits < 0) setTotalHits(result.total_hits);
                if (newCreatures.length >= result.total_hits) {
                    setHasMore(false);
                }
                setOffset(offset + result.hits.length);
                sessionStorage.setItem(sessionKey, JSON.stringify({ results: newCreatures, totalHits: result.total_hits, offset: offset + result.hits.length }));
                return newCreatures;
            });
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const deepSearchRequest = {
            ...router.query,
            phrases: JSON.parse(router.query.phrases as string),
        } as Omit<DeepSearchRequest, 'offset' | 'search_field'>;

        const sessionKey = getSessionStorageKey(deepSearchRequest, name);
        const cachedData = sessionStorage.getItem(sessionKey);

        if (cachedData) {
            const { results, totalHits, offset } = JSON.parse(cachedData);
            setCreatures(results);
            setTotalHits(totalHits);
            setOffset(offset);
            setHasMore(results.length < totalHits);
        } else if (router.isReady) {
            loadMoreData(deepSearchRequest, name);
        }
    }, [name, router.isReady]);

    return (
        <>
            <Stack sx={{ mt: 4 }}>
                {totalHits > -1 && <Typography sx={{ width: '100%' }} variant='h5'>Всего {totalHits} {handleTotalName(name)}</Typography>}
            </Stack>
            <InfiniteScroll
                dataLength={creatures.length}
                next={() => {
                    const deepSearchRequest = {
                        ...router.query,
                        phrases: JSON.parse(router.query.phrases as string),
                    } as Omit<DeepSearchRequest, 'offset' | 'search_field'>;
                    
                    loadMoreData(deepSearchRequest, name);
                }}
                hasMore={hasMore}
                loader={
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100px' }}>
                        <CircularProgress />
                    </Box>
                }
            >
                <Stack spacing={2} sx={{ mt: 1 }}>
                    {creatures.map((creature, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                            <UniversalCard type={name} creature={creature} searchType='deepSearch/dResult' />
                        </Grid>
                    ))}
                </Stack>
            </InfiniteScroll>
        </>
    );
};

const DeepSearchResultPage: React.FC = (): React.ReactElement => {
    const router: NextRouter = useRouter();
    const [type, setType] = useState<number | undefined>(undefined);

    const tabs: { label: string, component: React.ReactNode }[] = [
        { label: 'Публикации', component: <Results name='publications' /> },
        { label: 'Авторы', component: <Results name='authors' /> },
        { label: 'Города', component: <Results name='geopositions' /> },
        { label: 'Журналы', component: <Results name='journals' /> },
        // { label: 'Организации', component: <Results name='organizations' /> },
        { label: 'Конференции', component: <Results name='conferences' /> },
    ];

    useEffect(() => {
        setType(router.query.search_field ? parseInt(router.query.search_field as string) : 0);
    }, [router.query.search_field]);

    const handleTabChange = (index: number) => {
        setType(index);
        router.push({
            pathname: router.pathname,
            query: { ...router.query, search_field: index },
        }, undefined, { shallow: true });
    };

    return (
        <>
            <Head>
                <title>Результаты поиска</title>
            </Head>
            <Container>
                <TabsComponent tabs={tabs} propsValue={type} onChange={handleTabChange} />
            </Container>
        </>
    );
};

export default DeepSearchResultPage;
