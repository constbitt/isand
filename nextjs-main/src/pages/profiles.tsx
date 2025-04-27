// @ts-nocheck

import {getAuthors, getJournals, getConferences, getCities, getOrganizations, getRunningQueriesThunk as apiV1GetRunningQueriesThunk} from "@/src/store/api/serverApi";
import {wrapper} from "@/src/store/store";
import {getOrganization, getRunningQueriesThunk as apiV2GetRunningQueriesThunk} from "@/src/store/api/serverApiV2";
import React, {useState} from "react";
import {MenuItem, Select, SelectChangeEvent, Stack, Typography, Tabs, Tab} from "@mui/material";
import {
    selectCategoriesCutting,
    selectGraphType,
    selectLevel,
    selectScientificTerms,
    selectTermingCutting,
    selectThesaurusAvailableValues,
    selectThesaurusPath,
    selectTimeRange,
    selectTimeRangeBounds,
    setCategoryCutting,
    setGraphType,
    setLevel,
    setScientificTerms,
    setTermingCutting,
    setThesaurusPath,
    setTimeRange,
    setAuthors,
    setWorks,
    setLaboratories
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
import PostsArticlePlotWithCardJournals from "@/src/components/Profiles/PostsArticlePlotWithCardJournals";
import PostsArticlePlotWithCardConferences from "@/src/components/Profiles/PostsArticlePlotWithCardConferences";
import PostsArticlePlotWithCardOrganizations from "@/src/components/Profiles/PostsArticlePlotWithCardOrganizations";
import PostsArticlePlotWithCardCities from "@/src/components/Profiles/PostsArticlePlotWithCardCities";
import StyledCheckbox from "@/src/components/Fields/StyledCheckbox";
import StyledContainedButton from "@/src/components/Buttons/StyledContainedButton";
import Head from "next/head";

// Тип для идентификации типа сущности
type EntityType = 'profiles' | 'journals' | 'conferences' | 'organizations' | 'cities';

export default function UnifiedProfiles({
                                     profilesResponse,
                                     journalsResponse,
                                     conferencesResponse,
                                     laboratoriesResponse,
                                     organizationsResponse,
                                     citiesResponse
                                 }: {
    profilesResponse: ApiResponse<Author[]>,
    journalsResponse: ApiResponse<Author[]>,
    conferencesResponse: ApiResponse<Author[]>,
    laboratoriesResponse: ApiResponse<Laboratory[]>,
    organizationsResponse: ApiResponse<Author[]>,
    citiesResponse: ApiResponse<Author[]>
}) {

    // Состояние для переключения между типами сущностей
    const [entityType, setEntityType] = useState<EntityType>('profiles');
    
    const [openMenu, setOpenMenu] = useState(false);

    const dispatch = useTypedDispatch();

    const graph_type = useTypedSelector(selectGraphType);
    const scientific_terms = useTypedSelector(selectScientificTerms);
    const level = useTypedSelector(selectLevel);
    const category_cutting = useTypedSelector(selectCategoriesCutting);
    const terming_cutting = useTypedSelector(selectTermingCutting);
    const time_range = useTypedSelector(selectTimeRange);
    const time_range_bounds = useTypedSelector(selectTimeRangeBounds);
    const thesaurus_path = useTypedSelector(selectThesaurusPath);
    const thesaurus_available_values = useTypedSelector(selectThesaurusAvailableValues);

    // Получаем данные в зависимости от выбранного типа сущности
    let currentData;
    switch (entityType) {
        case 'profiles':
            currentData = profilesResponse;
            break;
        case 'journals':
            currentData = journalsResponse;
            break;
        case 'conferences':
            currentData = conferencesResponse;
            break;
        case 'organizations':
            currentData = organizationsResponse;
            break;
        case 'cities':
            currentData = citiesResponse;
            break;
        default:
            currentData = profilesResponse;
    }

    const {data: entities, error: entitiesError} = currentData;
    const {data: laboratories, error: laboratoriesError} = laboratoriesResponse;

    if (!entities) {
        return <div>{"Произошла ошибка при загрузке данных..."}</div>
    }

    if (!laboratories) {
        return <div>{"Произошла ошибка при загрузке данных организаций..."}</div>
    }

    // Получаем заголовок кнопки в зависимости от типа сущности
    const getButtonTitle = () => {
        switch (entityType) {
            case 'profiles':
                return "Выбор авторов";
            case 'journals':
                return "Выбор журналов";
            case 'conferences':
                return "Выбор конференций";
            case 'organizations':
                return "Выбор организаций";
            case 'cities':
                return "Выбор городов";
            default:
                return "Выбор";
        }
    };

    // Получаем заголовок страницы в зависимости от типа сущности
    const getPageTitle = () => {
        switch (entityType) {
            case 'profiles':
                return "Профили ученых и организаций";
            case 'journals':
                return "Профили журналов";
            case 'conferences':
                return "Профили конференций";
            case 'organizations':
                return "Профили организаций";
            case 'cities':
                return "Профили городов";
            default:
                return "Профили";
        }
    };

    // Функция для отображения соответствующего графика в зависимости от типа сущности
    const renderPlot = () => {
        switch (entityType) {
            case 'profiles':
                return <PostsArticlePlotWithCard />;
            case 'journals':
                return <PostsArticlePlotWithCardJournals />;
            case 'conferences':
                return <PostsArticlePlotWithCardConferences />;
            case 'organizations':
                return <PostsArticlePlotWithCardOrganizations />;
            case 'cities':
                return <PostsArticlePlotWithCardCities />;
            default:
                return <PostsArticlePlotWithCard />;
        }
    };

    // Обработчик изменения типа сущности
    const handleEntityTypeChange = (event: React.SyntheticEvent, newValue: EntityType) => {
        setEntityType(newValue);
        // Очищаем выбранные значения при переключении вкладок
        dispatch(setAuthors([]));
        dispatch(setWorks([]));
        dispatch(setLaboratories([]));
    };

    return ( 
        <>
            <Head>
                <title>{getPageTitle()}</title>
            </Head>
            <Stack sx={{height: "100%"}} mt={2} spacing={3}>
                {/* Табы для переключения между типами сущностей */}
                <Tabs 
                    value={entityType} 
                    onChange={handleEntityTypeChange} 
                    centered
                    sx={{ 
                        borderBottom: 1, 
                        borderColor: 'divider',
                        mb: 2
                    }}
                >
                    <Tab label="Ученые" value="profiles" sx={{ fontSize: '1.5rem' }} />
                    <Tab label="Журналы" value="journals" sx={{ fontSize: '1.5rem' }} />
                    <Tab label="Конференции" value="conferences" sx={{ fontSize: '1.5rem' }} />
                    <Tab label="Организации" value="organizations" sx={{ fontSize: '1.5rem' }} />
                    <Tab label="Города" value="cities" sx={{ fontSize: '1.5rem' }} />
                </Tabs>

                <Stack sx={{width: "70%", alignSelf: "center"}} spacing={3}>
                    <Stack direction={"row"} spacing={4} sx={{justifyContent: "center"}}>
                        <StyledContainedButton variant={"text"}
                            onClick={() => {
                                setOpenMenu(true)
                            }}>
                            {getButtonTitle()}
                        </StyledContainedButton>

                        <AuthorsLaboratoriesMenu 
                            setOpenMenu={setOpenMenu} 
                            openMenu={openMenu} 
                            authors={entities}
                            laboratories={laboratories}
                            entityType={entityType}
                        />

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

                    <Range value={time_range} 
                           min={time_range_bounds.min} 
                           max={time_range_bounds.max} 
                           onChange={(_, v) => {
                        dispatch(setTimeRange(v))
                    }} marks={true}/>
                </Stack>

                {/* Отображаем соответствующий график в зависимости от выбранного типа сущности */}
                {renderPlot()}

            </Stack>
        </>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    (store) => async () => {
        // Загружаем данные для всех типов сущностей
        const profilesResponse = await store.dispatch(getAuthors.initiate());
        const journalsResponse = await store.dispatch(getJournals.initiate());
        const conferencesResponse = await store.dispatch(getConferences.initiate());
        const laboratoriesResponse = await store.dispatch(getOrganization.initiate());
        const organizationsResponse = await store.dispatch(getOrganizations.initiate());
        const citiesResponse = await store.dispatch(getCities.initiate());

        await Promise.all(store.dispatch(apiV2GetRunningQueriesThunk()));
        await Promise.all(store.dispatch(apiV1GetRunningQueriesThunk()));

        return {
            props: {
                profilesResponse,
                journalsResponse,
                conferencesResponse,
                laboratoriesResponse,
                organizationsResponse,
                citiesResponse
            },
        };
    }
);