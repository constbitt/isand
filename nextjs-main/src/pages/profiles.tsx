// @ts-nocheck

import {getAuthors, getRunningQueriesThunk as apiV1GetRunningQueriesThunk} from "@/src/store/api/serverApi";


import {wrapper} from "@/src/store/store";
import {getOrganization, getRunningQueriesThunk as apiV2GetRunningQueriesThunk} from "@/src/store/api/serverApiV2";
import React, {useState} from "react";
import {MenuItem, Select, SelectChangeEvent, Stack, Typography} from "@mui/material";
import {
    selectCategoriesCutting,
    selectGraphType,
    selectLevel,
    selectScientificTerms,
    selectTermingCutting,
    selectThesaurusAvailableValues,
    selectThesaurusPath,
    selectTimeRange,
    setCategoryCutting,
    setGraphType,
    setLevel,
    setScientificTerms,
    setTermingCutting,
    setThesaurusPath,
    setTimeRange
} from "@/src/store/slices/profilesSlice";
import {useTypedSelector} from "@/src/hooks/useTypedSelector";
import {useTypedDispatch} from "@/src/hooks/useTypedDispatch";
import AuthorsLaboratoriesMenu from "@/src/components/Profiles/modals/AuthorsLaboratoriesMenu";
import {ApiResponse} from "@/src/store/types/apiTypes";
import {Author} from "@/src/store/types/authorTypes";
import {Laboratory} from "@/src/store/types/laboratoryTypes";
import StyledSlider from "@/src/components/Sliders/Slider";
import Range from "@/src/components/Sliders/Range";
import {graphTypeLabel, graphTypeTooltip} from "@/src/configs/profileConfig";
import SelectTooltip from "@/src/components/Tooltips/SelectTooltip";
import PostsArticlePlotWithCard from "@/src/components/Profiles/PostsArticlePlotWithCard";
import StyledCheckbox from "@/src/components/Fields/StyledCheckbox";
import StyledContainedButton from "@/src/components/Buttons/StyledContainedButton";
import Head from "next/head";

export default function Profiles({
                                     authorsResponse,
                                     laboratoriesResponse
                                 }: {
    authorsResponse: ApiResponse<Author[]>,
    laboratoriesResponse: ApiResponse<Laboratory[]>
}) {

    const [openMenu, setOpenMenu] = useState(false)

    const dispatch = useTypedDispatch()

    const graph_type = useTypedSelector(selectGraphType)

    const scientific_terms = useTypedSelector(selectScientificTerms)

    const level = useTypedSelector(selectLevel)

    const category_cutting = useTypedSelector(selectCategoriesCutting)

    const terming_cutting = useTypedSelector(selectTermingCutting)

    const time_range = useTypedSelector(selectTimeRange)

    const thesaurus_path = useTypedSelector(selectThesaurusPath)

    const thesaurus_available_values = useTypedSelector(selectThesaurusAvailableValues)

    const {data: authors, error: authorsError} = authorsResponse

    const {data: laboratories, error: laboratoriesError} = laboratoriesResponse

    if (!authors) {
        return <div>{"Some error occurred..."}</div>
    }
    

    if (!laboratories) {
        return <div>{"Some error occurred..."}</div>
    }

    return ( 
        <>
            <Head>
                <title>Профили ученых и организаций</title>
            </Head>
            <Stack sx={{height: "100%"}} mt={2} spacing={3}>

                <Stack sx={{width: "70%", alignSelf: "center"}} spacing={3}>
                    <Stack direction={"row"} spacing={4} sx={{justifyContent: "center"}}>
                        <StyledContainedButton variant={"text"}

                                            onClick={() => {
                                                setOpenMenu(true)
                                            }}>
                            {"Выбор авторов"}
                        </StyledContainedButton>


                        <AuthorsLaboratoriesMenu setOpenMenu={setOpenMenu} openMenu={openMenu} authors={authors}
                                                laboratories={laboratories}/>


                        <Select
                            value={graph_type}
                            onChange={(event) => {
                                dispatch(setGraphType(Number(event.target.value)))
                            }}
                            renderValue={(value) => {

                                return (
                                    <SelectTooltip titleText={graphTypeTooltip(value)}>{graphTypeLabel(value)}
                                    </SelectTooltip>);
                            }}
                            sx={{width: "30%"}}
                        >
                            <MenuItem value={0}>{"Абсолютный вектор"}</MenuItem>
                            <MenuItem value={1}>{"Стохастический вектор"}</MenuItem>
                            <MenuItem value={2}>{"Булевый вектор"}</MenuItem>
                            <MenuItem value={3}>{"По количеству используемых терминов"}</MenuItem>
                            <MenuItem value={4}>{"Термины"}</MenuItem>
                        </Select>
                        <StyledCheckbox value={scientific_terms} title={"Учитывать общенаучные термины"} onChange={() => {
                            dispatch(setScientificTerms(!scientific_terms))
                        }}/>
                    </Stack>

                    <Stack direction={"row"} spacing={4} sx={{justifyContent: "center",}}>
                        <StyledSlider label={"Уровень"} min={1} max={3} value={level} onChange={(_, v) => {
                            dispatch(setLevel(v))
                        }}/>
                        <StyledSlider label={"Отсечение по категориям"} min={0} max={10} value={category_cutting}
                                    onChange={(_, v) => {
                                        dispatch(setCategoryCutting(v))
                                    }}/>
                        <StyledSlider label={"Отсечение по терминам"} min={1} max={20} value={terming_cutting}
                                    onChange={(_, v) => {
                                        dispatch(setTermingCutting(v))
                                    }}/>
                    </Stack>

                    <Stack direction={"row"} spacing={2} sx={{justifyContent: "center", alignItems: "center"}}>
                        <Typography color={"secondary"} sx={{marginRight: "5px"}}>{"Корень"}</Typography><Typography
                        color={"secondary"}>{"→"}</Typography>
                        {thesaurus_path.map((item, index) => {
                            return <Stack key={index} sx={{marginRight: "5px"}} direction={"row"}><Typography
                                color={"secondary"}> {item}</Typography>
                                <Typography color={"secondary"}>{" → "}</Typography></Stack>
                        })}
                        {thesaurus_available_values.length === 0 && thesaurus_path.length > 0 ?
                            <StyledContainedButton variant={"text"} onClick={() => {
                                dispatch(setThesaurusPath([]))
                            }}>{"Вернуться в корень"}</StyledContainedButton> :
                            <Select value={""} displayEmpty={true} onChange={(e: SelectChangeEvent) => {
                                dispatch(setThesaurusPath([...thesaurus_path, e.target.value]))
                            }}
                                    renderValue={() => {
                                        return <Typography color={"gray"}>{"Выберите путь "}</Typography>
                                    }}
                            >

                                {thesaurus_available_values.map((item, index) => {
                                    return <MenuItem key={index} value={item}>{item}</MenuItem>
                                })}

                            </Select>
                        }
                    </Stack>

                    <Range value={time_range} min={1920} max={2023} onChange={(_, v) => {
                        dispatch(setTimeRange(v))
                    }} marks={true}/>
                </Stack>

                <PostsArticlePlotWithCard/>


            </Stack>
        </>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    (store) => async () => {

        const authorsResponse = await store.dispatch(getAuthors.initiate());

        const laboratoriesResponse = await store.dispatch(getOrganization.initiate())

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