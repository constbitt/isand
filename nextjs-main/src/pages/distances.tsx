// @ts-nocheck
import {Stack} from "@mui/material";
import StyledAutocomplete from "@/src/components/Fields/StyledAutocompleteField";
import React, {useEffect, useRef, useState} from "react";
import Head from "next/head";
import { getAllAviableAuthors, getRunningQueriesThunk as allAviableAuthorsGetRunningQueriesThunk, useGetProduceProfileMapQuery, useGetAllAviableConferenceQuery, useGetConferenceAuthorsQuery, } from "../store/api/serverApiV5";
import {wrapper} from "@/src/store/store";
import { ApiResponse } from "../store/types/apiTypes";
import { AllAuthorsResponse, AllAviableSource } from "../store/types/graphsTypes";
import DistanceComponent from "../components/Graphs/DistanceComponent";

const Distances: React.FC<{ authorsResponse: ApiResponse<AllAuthorsResponse[]> }> = ({authorsResponse}): React.ReactElement => {
    const [authors, setAuthors] = useState<AllAuthorsResponse[]>([])
    const [conferences, setConferences] = useState<AllAviableSource[]>([])
    const [currentConference, setCurrentConference] = useState<AllAviableSource | undefined>(undefined)
    const [dimensions, setDimensions] = useState<{width: number, height: number}>({ width: 0, height: 0 });
    
    const {data: produceProfileData} = useGetProduceProfileMapQuery()
    const {data: allAviableConference, refetch: refetchAviableConference} = useGetAllAviableConferenceQuery()
    const {data: conferenceAuthors, refetch: conferenceAuthorRefetch} = useGetConferenceAuthorsQuery(currentConference?.name_req ?? '')

    const graphContainer = useRef<HTMLDivElement>(null);

    useEffect(() => {
        (async () => {
            try {
                const result = await refetchAviableConference().unwrap()
                setConferences(result ?? [])
            } catch (error) {
                console.log(error)
            }
        })()
    }, [])

    useEffect(() => {
        (async () => {
            try {
                const result = await conferenceAuthorRefetch().unwrap()
            } catch (error) {
                console.log(error)
            }
        })()
    }, [currentConference])

    useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                setDimensions({ width, height: width * 2 / 3 });
            }
        });
    
        if (graphContainer.current) {
            resizeObserver.observe(graphContainer.current);
        }
    
        return () => {
            if (graphContainer.current) {
                resizeObserver.unobserve(graphContainer.current);
            }
        };
    }, [graphContainer.current]);

    if (!authorsResponse.data) {
        return <> 
            <Head>
                <title>Расстояния</title>
            </Head>
            <div>Some error occurred...</div>
        </>
    }

    return <>
        <Head>
            <title>Расстояния</title>
        </Head>
        <Stack sx={{height: "100%", alignSelf: "center"}}>
            <Stack ref={graphContainer} sx={{width: "70%", alignSelf: "center"}} spacing={2}>
                <Stack direction={"row"} width={'100%'} alignSelf={"center"} justifyContent={'space-between'}>
                    <StyledAutocomplete value={authors} onChange={(_, value) => {
                            setAuthors(value)
                        }} multiple={true} options={authorsResponse.data} placeholder={"Выберите автора"}
                        getOptionLabel={(option: AllAuthorsResponse) => `${option.fio} (${option.publs_count})`}
                        isOptionEqualToValue={(option: AllAuthorsResponse, value: AllAuthorsResponse) => {
                            return option.fio === value?.fio
                        }}
                        sx={{width: '45%'}}
                        getOptionKey={(option: AllAuthorsResponse) => option.prnd_author_id}
                    />

                    <StyledAutocomplete 
                        value={currentConference} 
                        onChange={(_, value) => {
                            setCurrentConference(value)
                        }} options={allAviableConference ? allAviableConference : []}
                        getOptionLabel={(option: AllAviableSource) => option.name_full} 
                        sx={{width: '45%'}} 
                        placeholder={"Выделить участников конференции"} 
                        fullWidth={true}
                    />
                </Stack>


                <StyledAutocomplete value={conferences} multiple={true} onChange={(_, value) => {
                    setConferences(value)
                }} options={allAviableConference ? allAviableConference : []} placeholder={"Выберите конференции"}
                    getOptionLabel={(option: AllAviableSource) => option.name_disp}
                    fullWidth={true}
                />
                <DistanceComponent 
                    height={dimensions.height} 
                    width={dimensions.width} 
                    authorData={authorsResponse.data} 
                    confData={allAviableConference ?? []} 
                    journalsData={[]} 
                    layoutData={produceProfileData ?? []} 
                    nodesToHighlightAsAuthors={authors.map(author => author.prnd_author_id.toString())}
                    confsToDisplay={conferences.map(conference => conference.name_req)}
                    nodesToHighlightAsConfAuthors={conferenceAuthors ?? []}
                />
            </Stack>
        </Stack>
    </>
}

export const getServerSideProps = wrapper.getServerSideProps(
    (store) => async () => {

        const authorsResponse = await store.dispatch(getAllAviableAuthors.initiate());

        const queries: any[] = []
        queries.push(store.dispatch(allAviableAuthorsGetRunningQueriesThunk()))

        await Promise.all(queries);

        return {
            props: {
                authorsResponse,
            },
        };
    }
);

export default Distances;