import React, {useEffect, useRef, useState} from "react";
import {MenuItem, Select, Stack, Typography} from "@mui/material";
import Range from "@/src/components/Sliders/Range";
import StyledCheckbox from "@/src/components/Fields/StyledCheckbox";
import StyledAutocomplete from "@/src/components/Fields/StyledAutocompleteField";
import GraphComponent from "@/src/components/Graphs/GraphComponent";
import Head from "next/head";
import { useGetAllAviableAuthorsQuery, useGetAuthorMinMaxYearQuery, usePostProduceAuthorConnectivityGraphMutation } from "../store/api/serverApiV5";
import { AllAuthorsResponse, Graph, Layout } from "../store/types/graphsTypes";


const Graphs: React.FC = (): React.ReactElement => {
    const [author, setAuthor] = useState<AllAuthorsResponse | undefined>(undefined)
    const [clipping, setClipping] = useState<number[]>([80])
    const [pageType, setPageType] = useState<'graphs' | 'graphs-cnt'>('graphs')
    const [lvl, setLvl] = useState<number>(3)
    const [timeRange, setTimeRange] = useState<{min: number, max: number}>({min: 0, max: 2000})
    const [minMax, setMinMax] = useState<{min: number, max: number}>({min: 0, max: 2000})
    const [useCommonTerms, setUseCommonTerms] = useState<boolean>(false)
    const [useTrace, setUseTrace] = useState<boolean>(true)
    const [useTracePrev, setUseTracePrev] = useState<boolean>(true)
    const [useLegend, setUseLegend] = useState<boolean>(true)
    const [graphData, setGraphData] = useState<{graph: Graph, layout: Layout[]} | undefined>(undefined)
    const [dimensions, setDimensions] = useState<{width: number, height: number}>({ width: 0, height: 0 })

    const graphContainer = useRef<HTMLDivElement>(null);

    const {refetch: refetchAuthorMinMaxYaer} =
        useGetAuthorMinMaxYearQuery(author?.prnd_author_id ?? -1, {
            skip: author === undefined,
        })
    const [postProduceAuthorConnectivityGraph] = usePostProduceAuthorConnectivityGraphMutation()
    const {data: authorsResponse} = useGetAllAviableAuthorsQuery()

    useEffect(() => {
        if (authorsResponse?.length) {
            setAuthor(authorsResponse[0]);
        }
    }, []);

    useEffect(() => {
        setUseTrace(useTracePrev)
    }, [useTracePrev])    

    useEffect(() => {
        (async () => {
            if (author && author.prnd_author_id) {
                const result = await refetchAuthorMinMaxYaer().unwrap();
                setMinMax(result ?? { min: 0, max: 2000 });
                setTimeRange(prev => ({ ...prev, ...(result ?? { min: 0, max: 2000 }) }));
                setClipping([80])
                setUseTracePrev(true)
                setUseLegend(true)
                setUseCommonTerms(false)
            }
        })()
    }, [author]);

    useEffect(() => {
        (async () => {
            try {
                if (author !== undefined) {
                    const result = await postProduceAuthorConnectivityGraph({
                        author_prnd_id: author.prnd_author_id,
                        factor_level: lvl,
                        use_common_terms: useCommonTerms,
                        years_range: [timeRange.min, timeRange.max],
                        scale_cutoff_by_paper_num: 0,
                        keep_data_in_graph: true,
                        min_node_count: clipping[0],
                        node_cutoff_mode: 'percent'
                    }).unwrap()
                    setGraphData(result)
                }
            } catch(error) {
                console.log(error)
            }
        })()
    }, [clipping, pageType, lvl, timeRange, useCommonTerms])

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

    return (
        <>
            <Head>
                <title>Графы</title>
            </Head>
            <Stack sx={{height: "100%", alignSelf: "center"}}>
                <Stack ref={graphContainer} sx={{width: "70%", alignSelf: "center", height: "100%", mt: 4}} spacing={3}>

                    <Stack spacing={2}>
                        <StyledAutocomplete value={author || null} onChange={(_, value) => {
                            setAuthor(value)
                        }} multiple={false} options={authorsResponse || []} placeholder={"Выберите автора"}
                            getOptionLabel={(option: AllAuthorsResponse) => `${option.fio} (${option.publs_count})`}
                            isOptionEqualToValue={(option: AllAuthorsResponse, value: AllAuthorsResponse) => {
                                return option.fio === value?.fio
                            }}
                            sx={{width: "50%"}} style={{}} disableClearable={true}
                            getOptionKey={(option: AllAuthorsResponse) => option.prnd_author_id}
                        />

                        <Stack direction={"row"} sx={{width: "100%", justifyContent: "space-between", height: "100%"}}
                            spacing={3}>
                            <Range place={'left'} value={clipping} min={0} max={100} step={5} onChange={(_, value) => {
                                setClipping(value)
                            }} width={"30%"} marks={[{value: 0, label: '0'}, {value: 100, label: '100'}]} label={"Отсечения по частоте"}/>
                            <Stack direction={"row"} spacing={2}>
                                <Typography>{"Расцветка вершин"}</Typography>
                                <Select value={pageType} onChange={(e) => {
                                    setPageType(e.target.value as ('graphs' | 'graphs-cnt'))
                                }} sx={{alignSelf: "center", width: '250px'}}>
                                    <MenuItem value={"graphs"}>{"По количеству связей"}</MenuItem>
                                    <MenuItem value={"graphs-cnt"}>{"По количеству вхождений"}</MenuItem>
                                </Select>
                            </Stack>
                            <Stack direction={"row"} spacing={2}>
                                <Typography>{"Уровень факторов"}</Typography>
                                <Select value={lvl} onChange={(e) => {
                                    setLvl(e.target.value as number)
                                }} sx={{alignSelf: "center"}}>
                                    <MenuItem value={0}>{"метафакторы"}</MenuItem>
                                    <MenuItem value={1}>{"факторы"}</MenuItem>
                                    <MenuItem value={2}>{"подфакторы"}</MenuItem>
                                    <MenuItem value={3}>{"термины"}</MenuItem>
                                </Select>
                            </Stack>
                        </Stack>
                        <Range value={[timeRange.min, timeRange.max]} min={minMax.min} max={minMax.max} onChange={(_, value) => {
                            setTimeRange({min: value[0], max: value[1]})
                        }} marks={true}/>
                        <Stack direction={"row"} sx={{justifyContent: "space-between"}}>
                            <StyledCheckbox value={useCommonTerms} title={"Включать общенаучные термины"} onChange={() => {
                                setUseCommonTerms(prev => !prev)
                            }}/>
                            <StyledCheckbox value={useTracePrev} title={"Отображать ребра"} onChange={() => {
                                setUseTracePrev(prev => !prev)
                            }}/>
                            <StyledCheckbox value={useLegend} title={"Отображать названия терминов"}
                                onChange={() => {
                                    setUseLegend(prev => !prev)
                            }}/>


                        </Stack>
                    </Stack>
                    <GraphComponent 
                        graphData={graphData} 
                        useEdges={useTrace} 
                        useLegend={useLegend} 
                        nodeSize={20} 
                        pageType={pageType} 
                        width={dimensions.width} 
                        height={dimensions.height}
                    />
                </Stack>

            </Stack>
        </>
    )
}

export default Graphs;