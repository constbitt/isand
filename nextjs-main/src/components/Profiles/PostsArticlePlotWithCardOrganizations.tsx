import { Box, Stack } from "@mui/material";
import React, { useEffect, useState } from "react";
import AnyBarChart from "@/src/components/Chart/BarChart/AnyBarChart";
import ProfileRatingsCardOrganizations from "@/src/components/Profiles/ProfileRatingsCardOrganizations";
import { useGetPostsForGraphMutation } from "@/src/store/api/serverApi";
import { useTypedSelector } from "@/src/hooks/useTypedSelector";
import {
    selectAuthors,
    selectCategoriesCutting,
    selectGraphType,
    selectLaboratories,
    selectLevel,
    selectScientificTerms,
    selectTermingCutting,
    selectThesaurusPath,
    selectTimeRange,
    selectWorks,
    setThesaurusAvailableValues
} from "@/src/store/slices/profilesSlice";
import { useTypedDispatch } from "@/src/hooks/useTypedDispatch";
import { PostsForGraphRequest, PostsForGraphResponsePreparedItem } from "@/src/store/types/postsForGraphTypes";
import { serializeSchemeValues } from "@/src/tools/schemeTool";
import { Loader } from "@/src/components/Loader/Loader";

const generateColor = (index: number) => {
    const hue = (index * 137.508) % 360;
    return `hsl(${hue}, 70%, 50%)`;
};

const PostsArticlePlotWithCardOrganizations = () => {
    const [curItem, setCurItem] = useState<({ name: string } & { [ids: string]: number }) | null>(null);
    const dispatch = useTypedDispatch();
    const [loading, setLoading] = useState(false);
    const [chartData, setChartData] = useState<({ name: string } & { [ids: string]: number })[]>([]);

    const graph_type = useTypedSelector(selectGraphType);
    const scientific_terms = useTypedSelector(selectScientificTerms);
    const level = useTypedSelector(selectLevel);
    const category_cutting = useTypedSelector(selectCategoriesCutting);
    const terming_cutting = useTypedSelector(selectTermingCutting);
    const time_range = useTypedSelector(selectTimeRange);
    const thesaurus_path = useTypedSelector(selectThesaurusPath);
    const selected_organizations = useTypedSelector(selectAuthors);
    const selected_laboratories = useTypedSelector(selectLaboratories);
    const selected_works = useTypedSelector(selectWorks);

    const [getPosts, _] = useGetPostsForGraphMutation();

    useEffect(() => {
        setLoading(true);
        setCurItem(null);

        if ((selected_organizations.length > 0 && selected_works.length > 0) || selected_laboratories.length > 0) {
            const req = {
                selected_organizations: selected_organizations.map(item => item.id),
                selected_works_id: selected_works.map(item => item.id),
                level: level,
                selected_scheme_id: graph_type,
                cutoff_value: category_cutting,
                cutoff_terms_value: terming_cutting,
                include_common_terms: scientific_terms,
                include_management_theory: "значение_include_management_theory",
                path: thesaurus_path,
                selected_type: "organizations",
                years: time_range
            } as PostsForGraphRequest;

            getPosts(req).then((response) => {
                const prep_resp: { [values: string]: ({ name: string } & { [ids: string]: number }) } = {};
                const resp = (response as any).data as unknown as PostsForGraphResponsePreparedItem[];

                if (resp && Array.isArray(resp)) {
                    resp.forEach((item) => {
                        item.terms.forEach((t_item) => {
                            const a = serializeSchemeValues(t_item.value);
                            if (a && a.length === level) {
                                if (!(t_item.value in prep_resp)) {
                                    prep_resp[t_item.value as keyof typeof prep_resp] = { 
                                        name: a.at(a.length - 1) || "" 
                                    } as unknown as { name: string } & { [ids: string]: number };
                                }
                                prep_resp[t_item.value as keyof typeof prep_resp][item.author] = t_item.count;
                            }
                        });
                    });
                }

                dispatch(setThesaurusAvailableValues(Object.keys(prep_resp).map((t) => {
                    const a = serializeSchemeValues(t);
                    return a?.at(a.length - 1) || "";
                })));
                setChartData(Object.values(prep_resp));
            }).finally(() => {
                setLoading(false);
            });
        } else {
            setChartData([]);
            setLoading(false);
        }
    }, [
        graph_type, scientific_terms, level,
        category_cutting, terming_cutting, time_range,
        thesaurus_path, selected_organizations, selected_works,
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ]);

    return (
        selected_organizations.length > 0 ? (
            <Stack direction={"row"} width={'80%'} alignSelf={'center'} spacing={2}>
                {loading ? <Loader /> :
                    <AnyBarChart data={selected_organizations.length === 0 ? [] : chartData || []}
                                onClick={(item) => {
                                    if (item?.activePayload?.at(0)) {
                                        const cur_item = item?.activePayload?.at(0).payload;
                                        setCurItem({ name: cur_item.name });
                                    }
                                }}
                                colors={(author_id) => {
                                    const index = selected_organizations.findIndex(a => a.id === author_id);
                                    return generateColor(index);
                                }}
                                formatter={(author_id) => {
                                    return selected_organizations.find(a => a.id === author_id)?.value || "";
                                }}
                                customTooltip={({ active, payload, label }: {
                                    active: boolean,
                                    payload: any[],
                                    label: string
                                }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div style={{ background: "white", padding: "5px", borderRadius: "10px" }}>
                                                <p className="label">{label}</p>
                                                <p>{"Вхождения:"}</p>
                                                {Object.entries(payload[0].payload).filter(([key, value]) => {
                                                    return key !== "name";
                                                }).map(([author_id, value], index) => {
                                                    return <p
                                                        key={index} className="intro">{`${selected_organizations.find(a => a.id === author_id)?.value || ""}: ${typeof value === "number" ? Math.round(value * 1000) / 1000 : value}`}</p>;
                                                })}
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                    />}
                {<Box>
                    <ProfileRatingsCardOrganizations curItem={curItem}/>
                </Box>}
            </Stack>
        ) : null
    );
};

export default PostsArticlePlotWithCardOrganizations; 