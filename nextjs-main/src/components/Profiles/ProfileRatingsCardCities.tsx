import {Card, Stack, Typography} from "@mui/material";
import {useGetArticleRatingMutation, useGetPostsForGraphMutation} from "@/src/store/api/serverApi";
import {useGetFactorsQuery} from "@/src/store/api/serverApiV2";
import {useEffect, useState} from "react";
import {serializeSchemeValues} from "@/src/tools/schemeTool";
import {PostsForGraphRequest} from "@/src/store/types/postsForGraphTypes";
import ArticleRatingsDialog from "@/src/components/Ratings/Cards/RatingCard/modal/ArticleRatingsDialog";
import TermsDialog from "@/src/components/Ratings/Cards/RatingCard/modal/TermsDialog";
import {useTypedSelector} from "@/src/hooks/useTypedSelector";
import {
    selectAuthors,
    selectGraphType,
    selectLaboratories,
    selectLevel,
    selectScientificTerms,
    selectThesaurusAvailableValues,
    selectThesaurusPath,
    selectTimeRange,
    selectWorks
} from "@/src/store/slices/profilesSlice";
import {Loader} from "@/src/components/Loader/Loader";
import StyledContainedButton from "@/src/components/Buttons/StyledContainedButton";
import { getFactorPath } from "@/src/tools/getFactorPath";

const ProfileRatingsCardCities = ({
    curItem
}: {
    curItem: ({ name: string } & { [ids: string]: number }) | null
}) => {
    const selected_cities = useTypedSelector(selectAuthors)
    const selected_laboratories = useTypedSelector(selectLaboratories)
    const selected_works = useTypedSelector(selectWorks)

    const [openTerms, setOpenTerms] = useState(false)
    const [openRatings, setOpenRatings] = useState(false)

    const graph_type = useTypedSelector(selectGraphType)
    const scientific_terms = useTypedSelector(selectScientificTerms)
    const level = useTypedSelector(selectLevel)
    const time_range = useTypedSelector(selectTimeRange)
    const thesaurus_path = useTypedSelector(selectThesaurusPath)
    const thesaurus_available_values = useTypedSelector(selectThesaurusAvailableValues)

    const [getPosts, {
        isLoading: isPostsForGraphLoading,
        isError: isPostForGraphError,
        error: postForGraphError,
        data: postForGraphData
    }] = useGetPostsForGraphMutation()

    const [getArticleRating, {
        isLoading: isArticleRatingLoading,
        isError: isArticleRatingError,
        error: articleRatingError,
        data: articleRatingData
    }] = useGetArticleRatingMutation()

    const { data: factorsData, isLoading: isFactorsLoading, isError: isFactorsError } = useGetFactorsQuery();

    useEffect(() => {
        if (curItem) {
            const tp = selected_laboratories.length > 0
            const path = getFactorPath(level, curItem.name, factorsData || []);

            const a_req = {
                selected_cities: tp ? selected_laboratories.map(item => item.div_id) : selected_cities.map(item => item.id),
                selected_works_id: selected_works.map(item => item.id),
                level: 1,
                selected_scheme_id: 4,
                cutoff_value: 1,
                cutoff_terms_value: 1,
                include_common_terms: scientific_terms,
                include_management_theory: "значение_include_management_theory",
                path: path,
                selected_type: "cities",
                years: time_range
            } as PostsForGraphRequest

            const l_req = {
                selected_cities: tp ? selected_laboratories.map(item => item.div_id) : selected_cities.map(item => item.id),
                selected_works_id: selected_works.map(item => item.id),
                level: level,
                selected_scheme_id: graph_type,
                cutoff_value: 0,
                cutoff_terms_value: 0,
                include_common_terms: scientific_terms,
                include_management_theory: "значение_include_management_theory",
                path: path,
                selected_type: "cities",
                years: time_range
            } as PostsForGraphRequest
            
            getPosts(a_req)
            getArticleRating(l_req)
        }
    }, [curItem]);

    const isPageLoading = isPostsForGraphLoading || isArticleRatingLoading;
    const isDataPresented = postForGraphData && articleRatingData;

    return (
        selected_cities.length > 0 ? (
            <Card sx={{
                marginTop: "20px",
                height: "500px",
                width: "350px",
                borderRadius: "20px",
                boxShadow: "rgba(0, 0, 0, 0.5) 4px 4px 8px 0px"
            }}>
                <Stack style={{padding: "15px", height: "100%"}}>
                    {curItem ?
                        <Stack alignItems={"center"} height={"100%"} spacing={2}>
                            <Typography textAlign={"center"} fontWeight={"bold"}>{"Город: "}{curItem.name}</Typography>
                            {
                                isPageLoading ?
                                    (<Loader/>)
                                    :
                                    (isDataPresented ?
                                        (<Stack height={"100%"} justifyContent={"space-between"}>
                                            <ul style={{listStyle: "disc"}}>
                                                {
                                                    postForGraphData[0].terms.slice(0, 7).map((item, index) => {
                                                        return (<li key={index}><Typography alignSelf={"left"} sx={{"::marker": {}}}
                                                                                key={item.value}>{serializeSchemeValues(item.value)?.at(0)} : {item.count}</Typography>
                                                        </li>)
                                                    })
                                                }
                                            </ul>
                                            <Stack spacing={2}>
                                                <StyledContainedButton variant={"text"} onClick={() => {
                                                    setOpenTerms(true)
                                                }}>
                                                    {"Все термины"}
                                                </StyledContainedButton>

                                                <TermsDialog terms={postForGraphData?.at(0)?.terms?.map((item) => {
                                                    return {
                                                        value: serializeSchemeValues(item.value)?.at(0) || "",
                                                        count: item.count
                                                    }
                                                }) || []} setOpen={setOpenTerms}
                                                             open={openTerms} scheme={curItem.name}
                                                             author={""}/>

                                                <StyledContainedButton variant={"text"} onClick={() => {
                                                    setOpenRatings(true)
                                                }}>
                                                    {"Рейтинг статей"}
                                                </StyledContainedButton>
                                                <ArticleRatingsDialog open={openRatings} setOpen={setOpenRatings}
                                                                      author={""}
                                                                      scheme={curItem.name}
                                                                      articleRatings={articleRatingData.at(0)?.ratings || []}
                                                />
                                            </Stack>
                                        </Stack>)
                                        :
                                        <>{"Ошибка"}</>)
                            }
                        </Stack>
                        : <Typography
                            sx={{color: "rgb(134, 142, 150)"}}>{"После клика на диаграмму здесь будет подробная информация о городе"}</Typography>
                    }
                </Stack>
            </Card>
        ) : null
    )
}

export default ProfileRatingsCardCities; 