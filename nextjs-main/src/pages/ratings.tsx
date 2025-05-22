// @ts-nocheck
import { Box, CircularProgress, FormControlLabel, MenuItem, Radio, RadioGroup, Select, Stack, Typography, Tabs, Tab, Chip } from "@mui/material";
import Slider from "@/src/components/Sliders/Slider";
import { useTypedDispatch } from "@/src/hooks/useTypedDispatch";
import { useTypedSelector } from "@/src/hooks/useTypedSelector";
import {
    selectLevel,
    selectRatingsPath,
    selectRatingsType,
    setLevel,
    setRatingsPath,
    setRatingsType
} from "@/src/store/slices/ratingsSlice";
import { Path } from "@/src/store/types/pathTypes";
import { useGetPathQuery, useGetRatingsQuery, getAuthors, useDownloadAuthorDataQuery, useCheckDownloadStatusQuery, useGetMetricsQuery, getRunningQueriesThunk as apiV1GetRunningQueriesThunk } from "@/src/store/api/serverApi";
import {useGetAuthorInfoQuery} from "@/src/store/api/serverApiV2_5";
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

    const ratings_type = useTypedSelector(selectRatingsType);
    const ratings_path = useTypedSelector(selectRatingsPath);

    const { data: authorsData } = profilesResponse;
    const { data: laboratoriesData } = laboratoriesResponse;
    const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);


    const {
        isLoading: pathIsLoading,
        isError: pathIsError,
        error: pathError,
        data: pathData
    } = useGetPathQuery({ level: level });

    const {
        isLoading: ratingsIsLoading,
        isError: ratingsIsError,
        error: ratingsError,
        data: ratingsData
    } = useGetRatingsQuery({
        type: ratings_type,
        path: ratings_path?.value || ""
    }, { skip: !ratings_path });

    const resetPage = () => {
        setCurItem(null);
    };

    useEffect(() => {
        if (pathData && pathData.length > 0) {
            dispatch(setRatingsPath(pathData[0]));
        }
    }, [pathData, dispatch]);


    const [factorLevel, setFactorLevel] = useState(3);
    const [k1Coefficient, setK1Coefficient] = useState(0.75);
    const [isLoading, setIsLoading] = useState(false);

    const [canFetchMetrics, setCanFetchMetrics] = useState(false);

    useEffect(() => {
        if (selectedAuthor) {
            setCanFetchMetrics(true);
        } else {
            setCanFetchMetrics(false);
        }
    }, [selectedAuthor]);

    useEffect(() => {
        if (selectedAuthor) {
            setCanFetchMetrics(true);
        }
    }, [factorLevel, k1Coefficient]);

    const selectedAuthorId = selectedAuthor?.id;
    const { data: downloadData, isSuccess: isDownloadSuccess } = useDownloadAuthorDataQuery(
        { author_id: selectedAuthorId || 0 },
        { skip: !selectedAuthorId }
    );

    const { data: checkDownloadStatusData, isSuccess: isCheckStatusSuccess } = useCheckDownloadStatusQuery(
        undefined,
        { skip: !selectedAuthorId }
    );

    const {
        data: metricsData,
        error: metricsError,
        isLoading: metricsIsLoading,
        isFetching: metricsIsFetching,
        refetch: refetchMetrics
    } = useGetMetricsQuery(
        {
            author_id: Number(selectedAuthorId),
            factor_level: factorLevel,
            k1_coefficient: k1Coefficient,
        },
        {
            skip: !selectedAuthorId || !canFetchMetrics,
            refetchOnMountOrArgChange: true
        }
    );

    useEffect(() => {
        if (canFetchMetrics && selectedAuthorId) {
            setIsLoading(true);
            refetchMetrics()
                .unwrap()
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [canFetchMetrics, selectedAuthorId, factorLevel, k1Coefficient, refetchMetrics]);


    const [authorInfoMap, setAuthorInfoMap] = useState(new Map());

    // Эффект для получения информации об авторах
    useEffect(() => {
        if (metricsData) {
            let data = metricsData;
            if (typeof metricsData === 'string') {
                try {
                    data = JSON.parse(metricsData.replace(/NaN/g, 'null'));
                } catch (error) {
                    console.error('Ошибка парсинга данных метрик:', error);
                    return;
                }
            }

            if (!data || !Array.isArray(data.results)) {
                return;
            }

            // Сначала фильтруем, сортируем и берем только нужные записи
            const topAuthors = data.results
                .filter((item: { author_id: number, SMM: number | null }) => 
                    item && 
                    typeof item.author_id === 'number' && 
                    item.SMM !== null && 
                    !isNaN(item.SMM)
                )
                .sort((a: { SMM: number }, b: { SMM: number }) => b.SMM - a.SMM)
                .slice(0, 80)
                .map((item: { author_id: number }) => item.author_id);

            // Создаем новый Map для хранения информации об авторах
            const newAuthorInfoMap = new Map();

            // Получаем информацию только о тех авторах, которые будут показаны
            Promise.all(
                topAuthors.map(async (authorId) => {
                    try {
                        const response = await fetch(`${api_v2_5_server}/authors/search?prnd=${authorId}`);
                        const authorInfo = await response.json();
                        if (authorInfo && authorInfo[0]) {
                            newAuthorInfoMap.set(authorId, authorInfo[0].author_fio);
                        }
                    } catch (error) {
                        console.error(`Ошибка получения информации об авторе ${authorId}:`, error);
                    }
                })
            ).then(() => {
                setAuthorInfoMap(newAuthorInfoMap);
            });
        }
    }, [metricsData]);

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
                        </Stack>
                        {(ratingsIsLoading || pathIsLoading) ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            ratingsData && (
                                <Stack sx={{ height: "750px" }}>
                                    <Stack direction={"row"} sx={{ height: "100%" }} spacing={2}>
                                        <BarChart data={ratingsData?.map((item) => {
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
                                                    console.log(cur_item);
                                                }
                                            }}
                                        />

                                        { <Box>
                                            <RatingsCard curItem={curItem} ratingsPath={ratings_path} ratingsType={ratings_type} />
                                        </Box> }
                                    </Stack>
                                </Stack>
                            )
                        )}
                    </>
                )}

                {activeTab === 1 && (
                    <>
                    <Stack direction={"row"} sx={{ width: "1000px", alignSelf: "center", justifyContent: "center" }} spacing={3}>
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
                    </Stack>
                    
                    {(() => {
                        if (isLoading || metricsIsLoading) {
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

                        if (metricsData) {
                            const chartData = (() => {
                                try {
                                    let data = metricsData;
                                    if (typeof metricsData === 'string') {
                                        data = JSON.parse(metricsData.replace(/NaN/g, 'null'));
                                    }

                                    if (!data || !Array.isArray(data.results)) {
                                        return [];
                                    }

                                    return data.results
                                        .filter((item: { author_id: number, SMM: number | null }) => 
                                            item && 
                                            typeof item.author_id === 'number' && 
                                            item.SMM !== null && 
                                            !isNaN(item.SMM)
                                        )
                                        .map((item: { author_id: number, SMM: number }) => ({
                                            name: authorInfoMap.get(item.author_id) || `Автор ${item.author_id}`,
                                            value: Math.round(item.SMM * 1000) / 10
                                        }))
                                        .sort((a: { value: number }, b: { value: number }) => b.value - a.value)
                                        .slice(0, 80);

                                } catch (error) {
                                    console.error('Ошибка обработки данных:', error);
                                    return [];
                                }
                            })();

                            if (chartData.length === 0) {
                                return (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                                        <Typography>
                                            Слишком частые запросы, попробуйте позже
                                        </Typography>
                                    </Box>
                                );
                            }

                            return (
                                <Stack sx={{ height: "750px", width: "100%" }}>
                                    <Stack direction={"row"} sx={{ height: "100%", width: "100%" }} spacing={2}>
                                        <Box sx={{ width: "100%", height: "100%" }}>
                                            <BarChart 
                                                data={chartData}
                                                onClick={() => {}}
                                                tooltip={null}
                                            />
                                        </Box>
                                    </Stack>
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