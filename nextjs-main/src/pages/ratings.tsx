import { Box, CircularProgress, FormControlLabel, MenuItem, Radio, RadioGroup, Select, Stack, Typography } from "@mui/material";
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
import { useGetPathQuery, useGetRatingsQuery } from "@/src/store/api/serverApi";
import { useEffect, useState } from "react";
import BarChart from "@/src/components/Chart/BarChart/SingleBarChart";
import { RatingsResponseItem } from "@/src/store/types/ratingsTypes";
import Head from "next/head";
import RatingsCard from "@/src/components/Ratings/Cards/RatingCard/RatingsCard";


const Ratings = () => {
    const dispatch = useTypedDispatch();
    const level = useTypedSelector(selectLevel);
    const [curItem, setCurItem] = useState<RatingsResponseItem | null>(null);

    const ratings_type = useTypedSelector(selectRatingsType);
    const ratings_path = useTypedSelector(selectRatingsPath);

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

    return (
        <>
            <Head>
                <title>Тематическое ранжирование</title>
            </Head>
            <Stack sx={{ width: "100%" }}>
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
            </Stack>
        </>
    );
}

export default Ratings;