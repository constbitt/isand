import React, { useEffect, useRef, useState } from "react";
import { Box, MenuItem, Select, Stack, Typography, Grid, Button} from "@mui/material";
import Range from "@/src/components/Sliders/Range";
import StyledAutocomplete from "@/src/components/Fields/StyledAutocompleteField";
import StyledCheckbox from "@/src/components/Fields/StyledCheckbox";
import Head from "next/head";
import { AllAuthorsResponse, AuthorDeltasResponse, Graph, Layout, Node } from "../store/types/graphsTypes";
import { usePostProduceThesaurusGraphMutation, useGetAuthorDeltasQuery, useGetAllAviableAuthorsQuery, useGetAllSubjectAreasQuery } from "../store/api/serverApiV5";
import GraphComponent from "../components/Graphs/GraphComponent";
import PathSelect from "../components/Graphs/PathSelect";
import { Item, SubjectArea } from "../store/types/thesaurusTypes";


const Thesaurus: React.FC = (): React.ReactElement => {
    //Константы
    const lvls: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const allOption = {id: 0, name: "все", id_parent: -1}
    //Функии
    const getRootIds = (
        items: (Item | SubjectArea)[][]
    ): number[] => {
        let result: number[] = [0];
        for (let i = 0; i < 4; i++) {
            if (items[i][0].id !== 0) {
                result = items[i].map(i => i.id)
                break
            }
        }
        return result
    }
    const handleClick = () => {
        (async () => {
            try {
                const result = await postProduceThesaurusGraph({
                    thesaurus_type: thesaurusType,
                    sg_depth: lvl,
                    use_root: parentTerm,
                    subtree_root_ids: getRootIds([terms, subfactors, factors, subjectAreas]),
                }).unwrap()
                setThesaurus(result)
            } catch (error) {
                console.log(error)
            }
        })()
    }

    const [author, setAuthor] = useState<AllAuthorsResponse | null>(null)
    const [clipping, setClipping] = useState<number[]>([80])
    const [coloring, setColoring] = useState<'power' | 'section'>('power')
    const [thesaurusType, setThesaurusType] = useState<'old'| 'new'>('new')
    const [parentTerm, setParentTerm] = useState<string | undefined>(undefined)
    const [lvl, setLvl] = useState<number>(3)
    const [useLegend, setUseLegend] = useState<boolean>(false)
    const [term, setTerm] = useState<string | undefined>(undefined)
    const [thesaurus, setThesaurus] = useState<{graph: Graph, layout: Layout[]} | undefined>(undefined)
    const [highlightsNodes, setHighLights] = useState<AuthorDeltasResponse[]>([])
    const [dimensions, setDimensions] = useState<{width: number, height: number}>({ width: 0, height: 0 });
    const [edges, setEdges] = useState<boolean>(true)
    //Состояния для PathSelect
    const [subjectAreas, setSubjectAreas] = useState<SubjectArea[]>([allOption])
    const [factors, setFactors] = useState<Item[]>([allOption])
    const [subfactors, setSubfactors] = useState<Item[]>([allOption])
    const [terms, setTerms] = useState<Item[]>([allOption])

    const graphContainer = useRef<HTMLDivElement>(null);

    const [postProduceThesaurusGraph] = usePostProduceThesaurusGraphMutation()
    const {data: authorsResponse} = useGetAllAviableAuthorsQuery()
    const {data: subjectAreasResponse} = useGetAllSubjectAreasQuery()
    const {refetch: refetchAuthor} = useGetAuthorDeltasQuery({
        auth_prnd_id: author?.prnd_author_id ?? 0,
        freq_cutoff: clipping[0]
    }, {
        skip: author === undefined || author === null,
    })

    useEffect(() => {
        (async () => {
            try {
                const response = await postProduceThesaurusGraph({
                    thesaurus_type: thesaurusType,
                    sg_depth: lvl,
                    use_root: parentTerm,
                    subtree_root_ids: [0],
                }).unwrap()
                setThesaurus(response)
            } catch (e) {
                console.error(e)
            }
        })()
    }, [])

    useEffect(() => {
        (async () => {
            try {
                const result = await postProduceThesaurusGraph({
                    thesaurus_type: thesaurusType,
                    sg_depth: lvl,
                    use_root: parentTerm,
                    subtree_root_ids: getRootIds([terms, subfactors, factors, subjectAreas]),
                }).unwrap()
                if (!parentTerm) setEdges(true) 
                else setEdges(false)
                setThesaurus(result)
            } catch (error) {
                console.log(error)
            }
        })()
    }, [thesaurusType, parentTerm, lvl, thesaurusType])

    useEffect(() => {
        (async () => {
            if (author) {
                try {
                    const result = await refetchAuthor().unwrap()
                    setHighLights(result)
                } catch (error) {
                    console.log(error)
                }
            }
        })()
    }, [author, clipping])

    useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width } = entry.contentRect;
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

    console.log(term)
    console.log(highlightsNodes.length)
    console.log(edges)
    console.log((term || highlightsNodes.length > 0 || edges))

    return (
        <>
            <Head>
                <title>Тезаурус</title>
            </Head>
            <Stack sx={{height: "100%", alignSelf: "center"}}>
                <Stack ref={graphContainer} sx={{width: "70%", alignSelf: "center", mt: 4}} spacing={2}>
                        
                    <Stack 
                        direction={"row"} 
                        sx={{width: "100%"}}
                        spacing={24}
                    >
                        <Box sx={{width: "50%", alignItems: "flex-start"}}>
                            <StyledAutocomplete value={author} onChange={(_, value) => {
                                    setAuthor(value)
                                    setClipping([80])
                                    if (!value) setHighLights([])
                                }} multiple={false} options={authorsResponse || []} placeholder={"Выберите автора"}
                                getOptionLabel={(option: AllAuthorsResponse) => `${option.fio} (${option.publs_count})`}
                                isOptionEqualToValue={(option: AllAuthorsResponse, value: AllAuthorsResponse) => {
                                    return option.fio === value?.fio
                                }}
                                getOptionKey={(option: AllAuthorsResponse) => option.prnd_author_id}
                            />
                        </Box>
                        <Range place={'left'} value={clipping} min={0} max={100} step={5} onChange={(_, value) => {
                            setClipping(value)
                        }} width={"30%"} marks={[{value: 0, label: '0'}, {value: 100, label: '100'}]} label={"Отсечения по частоте"}/>
                    </Stack>    

                    <Stack direction={'row'} spacing={4}>
                        <Grid container spacing={1} alignItems="center">
                            <Grid item xs={5}>
                                <Typography>{"Ключевой термин"}</Typography>
                            </Grid>
                            <Grid item xs={7}>
                                <Stack direction={'row'} spacing={0.5}>
                                    <StyledAutocomplete
                                        value={parentTerm}
                                        onChange={(_, value) => setParentTerm(value)}
                                        options={thesaurus?.graph.nodes.map((node: Node) => node.id) ?? []}
                                        placeholder={"Выберите термин"}
                                        getOptionLabel={(option: string) => option}
                                        isOptionEqualToValue={(option: string | undefined | null, value: string | undefined | null) => option === value}
                                        sx={{width: '100%'}}
                                    />
                                    <Select
                                        value={lvl}
                                        onChange={(e) => setLvl(e.target.value as number)}
                                        sx={{ alignSelf: "center" }}
                                    >
                                        {lvls.map((lvl: number, index: number) => (
                                            <MenuItem key={index} value={lvl}>
                                                {lvl}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Stack>
                            </Grid>
                        </Grid>


                        <Grid container spacing={1} alignItems="center">
                            <Grid item xs={5}>
                                <Typography>{"Подсветить термин"}</Typography>
                            </Grid>
                            <Grid item xs={7}>
                                <StyledAutocomplete value={term} onChange={(_, value) => {
                                    setTerm(value)
                                }} options={thesaurus?.graph.nodes.map((node: Node) => node.id) ?? []} placeholder={"Выберите термин"}
                                    getOptionLabel={(option: string) => option}
                                        isOptionEqualToValue={(option: string | undefined | null, value: string | undefined | null) => {
                                            return option === value
                                        }
                                    }
                                />
                            </Grid>
                        </Grid>

                    </Stack>

                    <StyledCheckbox value={useLegend} title={"Всегда отображать названия терминов"}
                        onChange={() => {
                            setUseLegend(prev => !prev)
                    }}/>

                    <Stack direction={'row'} spacing={2} alignItems={'center'} height={'96px'} justifyContent={'space-between'}>
                        <PathSelect
                            subjectAreasOptions={subjectAreasResponse || []}
                            subjectAreas={subjectAreas}
                            subjectAreasSetter={setSubjectAreas}
                            factors={factors}
                            factorsSetter={setFactors}
                            subfactors={subfactors}
                            subfactorsSetter={setSubfactors}
                            terms={terms}
                            termsSetter={setTerms}
                        />
                        <Button onClick={handleClick} type="submit" variant="contained" style={{ backgroundColor: '#1B4596', height: '40px', flexShrink: 0 }}>Перестроить</Button>
                    </Stack>
                    
                    <GraphComponent 
                        graphData={thesaurus} 
                        // useEdges={false} 
                        useEdges={(term || highlightsNodes.length > 0 || edges) ? false : true} 
                        useLegend={useLegend} 
                        nodeSize={10} 
                        pageType={'thesaurus'} 
                        highLightAround={term} 
                        highLightBetween={highlightsNodes.map(node => node.term_name)} 
                        height={dimensions.height}
                        width={dimensions.width}
                    />
                
                </Stack>
            </Stack>
        </>
    )
}

export default Thesaurus;