// @ts-nocheck
import { Box, CircularProgress, FormControlLabel, MenuItem, Radio, RadioGroup, Select, Stack, Typography, Tabs, Tab, Chip, Checkbox } from "@mui/material";
import Slider from "@/src/components/Sliders/Slider";
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import ListItemText from '@mui/material/ListItemText';
import { SelectChangeEvent } from '@mui/material/Select';
import { useTypedDispatch } from "@/src/hooks/useTypedDispatch";
import { useTypedSelector } from "@/src/hooks/useTypedSelector";
import * as React from 'react';

import {
    selectLevel,
    selectRatingsPath,
    selectRatingsType,
    setLevel,
    setRatingsPath,
    setRatingsType
} from "@/src/store/slices/ratingsSlice";
import { Path } from "@/src/store/types/pathTypes";
import { useFilterIdsMutation, useFilterIdsAnnotationsMutation} from '@/src/store/api/serverApi';

import {useGetPathAnnotationsQuery, useGetRatingsAnnotationsQuery, useDownloadAuthorDataAnnotationsQuery, useDownloadSingleAuthorDataAnnotationsQuery, useGetMetricsAnnotationsQuery, useGetPathQuery, useGetRatingsQuery, getAuthors, useDownloadAuthorDataQuery, useCheckDownloadStatusQuery, useGetMetricsQuery, getRunningQueriesThunk as apiV1GetRunningQueriesThunk } from "@/src/store/api/serverApi";
import {useGetAuthorInfoQuery} from "@/src/store/api/serverApiV2_5";
import { useGetAllAviableAuthorsQuery } from "@/src/store/api/serverApiV5";
import { api_v2_5_server } from "@/src/configs/apiConfig";
import { useEffect, useState } from "react";
import BarChart from "@/src/components/Chart/BarChart/SingleBarChart";
import { RatingsResponseItem } from "@/src/store/types/ratingsTypes";
import Head from "next/head";
import RatingsCard from "@/src/components/Ratings/Cards/RatingCard/RatingsCard";
import AuthorsLaboratoriesMenu from "@/src/components/Profiles/modals/AuthorsLaboratoriesMenu";
import { Author } from "@/src/store/types/authorTypes";
import { Laboratory } from "@/src/store/types/laboratoryTypes";
import { getOrganization, getRunningQueriesThunk as apiV2GetRunningQueriesThunk } from "@/src/store/api/serverApiV2";
import StyledContainedButton from "@/src/components/Buttons/StyledContainedButton";
import { wrapper } from "@/src/store/store";
import { ApiResponse } from "@/src/store/types/apiTypes";
import StyledSelect from "@/src/components/Fields/StyledSelect";
import Papa from 'papaparse';
import { BarCustomTooltip, BarAuthorTooltip } from "@/src/components/Chart/BarChart/BarCustomTooltip";

const SOURCE_OPTIONS = [
    { value: "prnd", label: "БД ИПУ РАН" },
    { value: "mathnet", label: "Mathnet" },
    { value: "other", label: "Другое" },
] as const;

const SELECT_SX = {
    minWidth: 170,
    fontSize: '1.05rem',

    '& .MuiOutlinedInput-root': {
        height: 40, 
        paddingRight: 1,
    },

    '& .MuiSelect-select': {
        display: 'flex',
        alignItems: 'center',
        height: '32px',

        fontSize: '1.05rem',
    },

};

const Ratings = ({
    profilesResponse,
    laboratoriesResponse
}: {
    profilesResponse: ApiResponse<Author[]>,
    laboratoriesResponse: ApiResponse<Laboratory[]>
}) => {
    const dispatch = useTypedDispatch();
    const level = useTypedSelector(selectLevel);
    const [curItem, setCurItem] = useState<RatingsResponseItem | null>(null);
    const [activeTab, setActiveTab] = useState(0);
    const [openMenu, setOpenMenu] = useState(false);
    const [selectedPath, setSelectedPath] = useState("Подтемы");
    const [isMathNetChecked, setIsMathNetChecked] = useState(false);
    //
    const [calcMethod, setCalcMethod] = useState<"fulltexts" | "annotations">("fulltexts");



    const ratings_type = useTypedSelector(selectRatingsType);
    const ratings_path = useTypedSelector(selectRatingsPath);

    const { data: authorsData } = profilesResponse;
    const { data: laboratoriesData } = laboratoriesResponse;
    const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);


    const {
        isLoading: pathIsLoadingDefault,
        isError: pathIsErrorDefault,
        error: pathErrorDefault,
        data: pathDataDefault,
    } = useGetPathQuery({ level });

    const {
        isLoading: pathIsLoadingAnnotations,
        isError: pathIsErrorAnnotations,
        error: pathErrorAnnotations,
        data: pathDataAnnotations,
    } = useGetPathAnnotationsQuery({ level });

    const pathData = pathDataDefault;
    const pathIsLoading = pathIsLoadingDefault;
    const pathIsError = pathIsErrorDefault;
    const pathError = pathErrorDefault;

    const {
        isLoading: ratingsIsLoadingDefault,
        isError: ratingsIsErrorDefault,
        error: ratingsErrorDefault,
        data: ratingsDataDefault
    } = useGetRatingsQuery(
        {
            type: ratings_type,
            path: ratings_path?.value || ""
        },
        { skip: !ratings_path }
    );

    const {
        isLoading: ratingsIsLoadingAnnotations,
        isError: ratingsIsErrorAnnotations,
        error: ratingsErrorAnnotations,
        data: ratingsDataAnnotations
    } = useGetRatingsAnnotationsQuery(
        {
            type: ratings_type,
            path: ratings_path?.value || ""
        },
        { skip: !ratings_path }
    );

    const ratingsData =
    calcMethod === "annotations"
        ? ratingsDataAnnotations
        : ratingsDataDefault;

    const ratingsIsLoading =
        calcMethod === "annotations"
            ? ratingsIsLoadingAnnotations
            : ratingsIsLoadingDefault;

    const ratingsIsError =
        calcMethod === "annotations"
            ? ratingsIsErrorAnnotations
            : ratingsIsErrorDefault;

    const ratingsError =
        calcMethod === "annotations"
            ? ratingsErrorAnnotations
            : ratingsErrorDefault;


    const [targets, setTargets] = useState<string[]>(["prnd"]);

    console.log("targets: ", targets);
    const [filterIds, { data}] = useFilterIdsMutation();
    const [filterIdsAnnotations, { dataAnnotations}] = useFilterIdsAnnotationsMutation();
    const [filteredRatingsData, setFilteredRatingsData] = useState<RatingsResponseItem[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!ratingsData || targets.length === 0) {
                setFilteredRatingsData(ratingsData || []);
                return;
            }

            const ids = ratingsData.map(item => Number(item.id));

            try {
                const result =
                    calcMethod === "annotations"
                        ? await filterIdsAnnotations({ ids, targets }).unwrap()
                        : await filterIds({ ids, targets }).unwrap();
                const filteredIds = result.filtered_ids.map(
                    (item: any) => Number(item.account_id)
                );

                const filteredData = ratingsData.filter(item =>
                    filteredIds.includes(Number(item.id))
                );
                setFilteredRatingsData(filteredData);
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, [
        ratingsData,
        targets,
        calcMethod,
        filterIds,
        filterIdsAnnotations
    ]);

    const resetPage = () => {
        setCurItem(null);
    };

    useEffect(() => {
        if (pathData && pathData.length > 0) {
            dispatch(setRatingsPath(pathData[0]));
        }
    }, [pathData, dispatch]);

    const { data: allAviableAuthorsData } = useGetAllAviableAuthorsQuery();


// ранжирование по авторам
    const [calcMethodAuthors, setCalcMethodAuthors] = useState<"fulltexts" | "annotations">("fulltexts");
    const [factorLevel, setFactorLevel] = useState(3);
    const [k1Coefficient, setK1Coefficient] = useState(0.75);

    const selectedAuthorId = selectedAuthor?.id;

    const canFetchMetrics = Boolean(selectedAuthorId);

    const { isSuccess: isDownloadSuccess } = useDownloadAuthorDataQuery(
    { author_id: selectedAuthorId ?? 0 },
    { skip: !selectedAuthorId }
    );

    const { isSuccess: isDownloadSuccessAnnotations } =
    useDownloadAuthorDataAnnotationsQuery(
        { author_id: selectedAuthorId ?? 0 },
        { skip: !selectedAuthorId }
    );

    const { isSuccess: isDownloadSuccessSingleAnnotations } =
    useDownloadSingleAuthorDataAnnotationsQuery(
        { author_id: selectedAuthorId ?? 0 },
        { skip: !selectedAuthorId }
    );

    const { isSuccess: isCheckStatusSuccess } =
    useCheckDownloadStatusQuery(undefined, { skip: !selectedAuthorId });

    const isAllDownloaded =
    isDownloadSuccess &&
    isDownloadSuccessAnnotations &&
    isDownloadSuccessSingleAnnotations &&
    isCheckStatusSuccess;

    const metricsArgs = {
    author_id: Number(selectedAuthorId),
    factor_level: factorLevel,
    k1_coefficient: k1Coefficient,
    };

    const defaultMetricsQuery = useGetMetricsQuery(metricsArgs, {
    skip:
        !canFetchMetrics ||
        !isAllDownloaded ||
        calcMethodAuthors !== "fulltexts",
    refetchOnMountOrArgChange: true,
    });

    const annotationsMetricsQuery = useGetMetricsAnnotationsQuery(metricsArgs, {
    skip:
        !canFetchMetrics ||
        !isAllDownloaded ||
        calcMethodAuthors !== "annotations",
    refetchOnMountOrArgChange: true,
    });

    const activeQuery =
    calcMethodAuthors === "annotations"
        ? annotationsMetricsQuery
        : defaultMetricsQuery;

    const {
    data: metricsData,
    error: metricsError,
    isLoading: metricsIsLoading,
    isFetching: metricsIsFetching,
    refetch: refetchMetrics,
    } = activeQuery;

    const MAX_RETRIES = 3;
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
    if (retryCount >= MAX_RETRIES) return;

    if (calcMethodAuthors === "fulltexts" && defaultMetricsQuery.error) {
        const timeout = setTimeout(() => {
        defaultMetricsQuery.refetch();
        setRetryCount((prev) => prev + 1);
        }, 1000);

        return () => clearTimeout(timeout);
    }

    if (calcMethodAuthors === "annotations" && annotationsMetricsQuery.error) {
        const timeout = setTimeout(() => {
        annotationsMetricsQuery.refetch();
        setRetryCount((prev) => prev + 1);
        }, 1000);

        return () => clearTimeout(timeout);
    }
    }, [
    calcMethodAuthors,
    defaultMetricsQuery.error,
    annotationsMetricsQuery.error,
    retryCount,
    ]);

    useEffect(() => {
    if (
        (calcMethodAuthors === "fulltexts" && !defaultMetricsQuery.error) ||
        (calcMethodAuthors === "annotations" && !annotationsMetricsQuery.error)
    ) {
        setRetryCount(0);
    }
    }, [
    calcMethodAuthors,
    defaultMetricsQuery.error,
    annotationsMetricsQuery.error,
    ]);

    console.log("metricsData: ", metricsData);
    const [filteredMetricsData, setFilteredMetricsData] = useState<RatingsResponseItem[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!metricsData || targets.length === 0) {
                setFilteredMetricsData(metricsData || []);
                return;
            }

            const ids = JSON.parse(metricsData.replace(/NaN/g, 'null')).results.map(item => Number(item.author_id));

            try {
                const result =
                    calcMethod === "annotations"
                        ? await filterIdsAnnotations({ ids, targets }).unwrap()
                        : await filterIds({ ids, targets }).unwrap();
                const filteredIds = result.filtered_ids.map(
                    (item: any) => Number(item.account_id)
                );

                const filteredData = JSON.parse(metricsData.replace(/NaN/g, 'null')).results.filter(item => 
                    filteredIds.includes(Number(item.author_id))
                );
                setFilteredMetricsData(filteredData);
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, [
        metricsData,
        targets,
        calcMethodAuthors,
        filterIds,
        filterIdsAnnotations
    ]);

    console.log("filteredMetricsData: ", filteredMetricsData);

    const [authorInfoMap, setAuthorInfoMap] = useState(new Map());
    
        useEffect(() => {
            if (metricsData && allAviableAuthorsData) {
                let data = metricsData;
                if (typeof metricsData === 'string') {
                    try {
                        data = JSON.parse(metricsData.replace(/NaN/g, 'null'));
                    } catch (error) {
                        return;
                    }
                }
    
                if (!data || !Array.isArray(data.results)) {
                    return;
                }
                
    
                const topAuthors = data.results
                    .filter((item: { author_id: number, SMM: number | null }) => 
                        item && 
                        typeof item.author_id === 'number' && 
                        item.SMM !== null && 
                        !isNaN(item.SMM)
                    )
                    .sort((a: { SMM: number }, b: { SMM: number }) => b.SMM - a.SMM)
                    .slice(0, 40000)
                    .map((item: { author_id: number }) => item.author_id);
    
                const newAuthorInfoMap = new Map();
    
                
                topAuthors.forEach((authorId) => {
                    const authorInfo = allAviableAuthorsData.find(
                        author => author.prnd_author_id === authorId
                    );
                    if (authorInfo) {
                        newAuthorInfoMap.set(authorId, authorInfo.fio);
                    }
                    
                });
                
                setAuthorInfoMap(newAuthorInfoMap);
            }
        }, [metricsData, allAviableAuthorsData]);

//
    

            
    return (
        <>
            <Head>
                <title>Тематическое ранжирование</title>
            </Head>
            <Stack sx={{ width: "100%" }}>
                <Tabs 
                    value={activeTab} 
                    onChange={(_, newValue) => setActiveTab(newValue)}
                    sx={{ 
                        mb: 2,
                        '& .MuiTabs-flexContainer': {
                            justifyContent: 'center'
                        }
                    }}
                >
                    <Tab 
                        label="Темы" 
                        sx={{ 
                            fontSize: '1.5rem',
                            fontWeight: 500
                        }}
                    />
                    <Tab 
                        label="Авторы" 
                        sx={{ 
                            fontSize: '1.5rem',
                            fontWeight: 500
                        }}
                    />
                </Tabs>

                {activeTab === 0 && (
                    <>
                        <Stack direction={"row"} mt={2} sx={{ alignSelf: "center" }} spacing={3}>
                            <Slider value={level} label={"Уровень"} min={1} max={3} onChange={(_, value) => {
                                dispatch(setLevel(value));
                                resetPage();
                            }} />

                            <Select
                                value={ratings_path}

                                renderValue={(value) => {
                                    return <Typography>{value?.label}</Typography>;
                                }}
                                onChange={(e) => {
                                    dispatch(setRatingsPath(e.target.value as Path));
                                    resetPage();
                                }}
                            >
                                {
                                    pathData?.map((item) => {
                                        return (<MenuItem value={item as any} key={item.value}>{item.label}</MenuItem>);
                                    })
                                }
                            </Select>

                            <Select
                                labelId="mathnet-select-label"
                                
                                value={calcMethod}
                                onChange={(e) => {
                                    setCalcMethod(e.target.value);
                                }}
                            >
                                <MenuItem value="fulltexts">Полнотексты</MenuItem>
                                <MenuItem value="annotations">Аннотации</MenuItem>
                            </Select>

                            <Select
                                multiple
                                sx={SELECT_SX}
                                value={targets}
                                onChange={(e) =>
                                    setTargets(
                                        typeof e.target.value === "string"
                                            ? e.target.value.split(",")
                                            : e.target.value
                                    )
                                }
                                input={<OutlinedInput />}
                                renderValue={(selected) =>
                                    selected
                                        .map(v =>
                                            SOURCE_OPTIONS.find(o => o.value === v)?.label
                                        )
                                        .join(", ")
                                }
                            >
                                {SOURCE_OPTIONS.map(o => (
                                    <MenuItem key={o.value} value={o.value}>
                                        <Checkbox checked={targets.includes(o.value)} />
                                        <ListItemText primary={o.label} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </Stack>
                        {(ratingsIsLoading || pathIsLoading) ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                                <CircularProgress />
                            </Box>
                        ) : (   
                                <Stack sx={{ height: "750px" }}>
                                    <Stack direction={"row"} sx={{ height: "100%" }} spacing={2}>
                                        <BarChart data={(filteredRatingsData)?.slice(0, 30).map((item) => {
                                            return {
                                                name: item.name,
                                                id: item.id,
                                                value: Math.trunc(item.value)
                                            };
                                        }) || []}
                                            onClick={(item) => {
                                                if (item?.activePayload?.at(0)) {
                                                    const cur_item = item?.activePayload?.at(0).payload;
                                                    setCurItem({ name: cur_item.name, value: cur_item.value, id: cur_item.id });
                                                }
                                            }}
                                            tooltip={BarCustomTooltip}
                                        />

                                        { <Box>
                                            <RatingsCard curItem={curItem} ratingsPath={ratings_path} ratingsType={ratings_type} />
                                        </Box> }
                                    </Stack>
                                </Stack>
                        )}
                    </>
                )}
                {activeTab === 1 && (
                    <>
                    <Stack direction={"row"} sx={{ alignSelf: "center", justifyContent: "center" }} spacing={3}>
                        <StyledSelect
                            value={selectedAuthor}
                            onChange={(selected) => {
                                setSelectedAuthor(selected as Author);
                            }}
                            multiple={false}
                            options={authorsData || []}
                            placeholder={"Выберите автора"}
                            renderValue={(selected: Author) => (
                                <Chip
                                    label={selected?.name}
                                    sx={{ maxWidth: 250 }}
                                />
                            )}
                        />

                        <Select
                            value={selectedPath}
                            renderValue={(value) => <Typography>{value}</Typography>}
                            onChange={(e) => {
                                const newValue = e.target.value;
                                setSelectedPath(newValue);
                                const newFactorLevel = newValue === "Термины" ? 2 : 3;
                                setFactorLevel(newFactorLevel);
                            }}
                        >
                            <MenuItem value="Термины">Термины</MenuItem>
                            <MenuItem value="Подтемы">Подтемы</MenuItem>
                        </Select>

                        <Slider 
                            value={k1Coefficient} 
                            label={"Процент отсечения результатов"} 
                            min={0} 
                            max={1} 
                            step={0.01}
                            onChange={(_, value) => {
                                setK1Coefficient(value);
                            }} 
                        />
                            <Select
                                labelId="mathnet-select-label"
                                
                                value={calcMethodAuthors}
                                onChange={(e) => {
                                    setCalcMethodAuthors(e.target.value);
                                }}
                            >
                                <MenuItem value="fulltexts">Полнотексты</MenuItem>
                                <MenuItem value="annotations">Аннотации</MenuItem>
                            </Select>

                            <Select
                                multiple
                                sx={SELECT_SX}
                                value={targets}
                                onChange={(e) =>
                                    setTargets(
                                        typeof e.target.value === "string"
                                            ? e.target.value.split(",")
                                            : e.target.value
                                    )
                                }
                                input={<OutlinedInput />}
                                renderValue={(selected) =>
                                    selected
                                        .map(v =>
                                            SOURCE_OPTIONS.find(o => o.value === v)?.label
                                        )
                                        .join(", ")
                                }
                            >
                                {SOURCE_OPTIONS.map(o => (
                                    <MenuItem key={o.value} value={o.value}>
                                        <Checkbox checked={targets.includes(o.value)} />
                                        <ListItemText primary={o.label} />
                                    </MenuItem>
                                ))}
                            </Select>
                    </Stack>

                    {(() => {
                        if (metricsIsLoading || metricsIsFetching) {
                            return (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                                    <CircularProgress />
                                </Box>
                            );
                        }

                        if (!selectedAuthorId) {
                            return (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>

                                </Box>
                            );
                        }

                        if (metricsError) {
                            return (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                                    <Typography color="error">
                                        Ошибка при загрузке метрик
                                    </Typography>
                                </Box>
                            );
                        }

                        if (filteredMetricsData && targets.length > 0) {
                            const chartData = filteredMetricsData
                                .filter(
                                (item) =>
                                    typeof item.author_id === "number" &&
                                    typeof item.SMM === "number" &&
                                    !isNaN(item.SMM)
                                )
                                .sort((a, b) => b.SMM - a.SMM)
                                .slice(0, 80)
                                .map((item) => ({
                                name: authorInfoMap.get(item.author_id) ?? `Автор ${item.author_id}`,
                                value: Math.round(item.SMM * 1000) / 10,
                                }));

                            if (chartData.length === 0) {
                                return (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                                    <Typography>Нет данных для отображения</Typography>
                                </Box>
                                );
                            }
                            {targets.length === 0 || !selectedAuthorId || metricsError || !filteredMetricsData || filteredMetricsData.length === 0 ? (
                            <Typography>Нет данных для отображения</Typography>
                            ) : (
                            <BarChart data={chartData} onClick={() => {}} tooltip={BarAuthorTooltip} />
                            )}

                        return (
                            <Stack sx={{ height: "750px", width: "100%" }}>
                            <Box sx={{ width: "100%", height: "100%" }}>
                                <BarChart
                                data={chartData}
                                onClick={() => {}}
                                tooltip={BarAuthorTooltip}
                                />
                            </Box>
                            </Stack>
                        );
                        }


                        return (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                                <Typography>
                                    Нет данных для отображения
                                </Typography>
                            </Box>
                        );
                    })()}
                    </>
                )}

            </Stack>
        </>
    );
}

export const getServerSideProps = wrapper.getServerSideProps(
    (store) => async () => {
        const profilesResponse = await store.dispatch(getAuthors.initiate());
        const laboratoriesResponse = await store.dispatch(getOrganization.initiate());

        await Promise.all(store.dispatch(apiV2GetRunningQueriesThunk()));
        await Promise.all(store.dispatch(apiV1GetRunningQueriesThunk()));

        return {
            props: {
                profilesResponse,
                laboratoriesResponse
            },
        };
    }
);

export default Ratings;