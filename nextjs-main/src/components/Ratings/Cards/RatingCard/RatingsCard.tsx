import {Card, Stack, Typography} from "@mui/material";
import {RatingsResponseItem} from "@/src/store/types/ratingsTypes";
import {useGetArticleRatingMutation, useGetPostsForGraphMutation} from "@/src/store/api/serverApi";
import React, {useEffect, useState} from "react";
import {serializeSchemeValues} from "@/src/tools/schemeTool";
import {PostsForGraphRequest} from "@/src/store/types/postsForGraphTypes";
import {Path} from "@/src/store/types/pathTypes"
import ArticleRatingsDialog from "@/src/components/Ratings/Cards/RatingCard/modal/ArticleRatingsDialog";
import TermsDialog from "@/src/components/Ratings/Cards/RatingCard/modal/TermsDialog";
import {Loader} from "@/src/components/Loader/Loader";
import StyledContainedButton from "@/src/components/Buttons/StyledContainedButton";



const RatingsCard = ({
                         curItem,
                         ratingsPath,
                         ratingsType
                     }: {
    curItem: RatingsResponseItem | null,
    ratingsPath: Path | null,
    ratingsType: string
}) => {

    const normalized_scheme = serializeSchemeValues(ratingsPath?.value)

    const [openTerms, setOpenTerms] = useState(false)

    const [openRatings, setOpenRatings] = useState(false)

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


    useEffect(() => {
        if (curItem) {
            const req = {
                selected_authors: [curItem.id],
                selected_works_id: ["Все работы"],
                level: 1,
                selected_scheme_id: 4,
                cutoff_value: 0,
                cutoff_terms_value: 0,
                include_common_terms: true,
                include_management_theory: "значение_include_management_theory",
                path: normalized_scheme,
                selected_type: ratingsType
            } as PostsForGraphRequest
            getPosts(req)
            getArticleRating(req)
        }
    }, [
        curItem,
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ]);

    const isPageLoading = isPostsForGraphLoading || isArticleRatingLoading;

    const isDataPresented = postForGraphData && articleRatingData;

    return (
        <Card sx={{
            marginTop: "20px",
            height: "500px",
            width: "300px",
            borderRadius: "20px",
            boxShadow: "rgba(0, 0, 0, 0.5) 4px 4px 8px 0px"
        }}>
            <Stack style={{ padding: "15px", height: "100%" }}>
                {curItem ?
                    <Stack alignItems={"center"} height={"100%"} spacing={2}>
                        <Stack>
                            <Typography fontWeight={"bold"}>Автор: {curItem.name}</Typography>
                            <Typography fontWeight={"bold"}>Категория: {normalized_scheme}</Typography>
                        </Stack>
                        {
                            isPageLoading ?
                                (<Loader />)
                                :
                                (isDataPresented ?
                                    (<Stack justifyContent={"space-between"} height={"100%"} width={"100%"}>
                                        <ul style={{ listStyle: "disc", paddingLeft: "20px", overflowWrap: "break-word" }}>
                                            {
                                                postForGraphData[0].terms.slice(0, Math.min(7, postForGraphData[0].terms.length)).map((item, index) => {
                                                    return (
                                                        <li key={index}>
                                                            <Typography key={item.value}>
                                                                {serializeSchemeValues(item.value)?.at(0)} : {item.count}
                                                            </Typography>
                                                        </li>
                                                    )
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
                                                open={openTerms} author={curItem.name}
                                                scheme={normalized_scheme?.at(0) || ""} />
        
                                            <StyledContainedButton variant={"text"} onClick={() => {
                                                setOpenRatings(true)
                                            }}>
                                                {"Рейтинг статей"}
                                            </StyledContainedButton>
                                            <ArticleRatingsDialog open={openRatings} setOpen={setOpenRatings}
                                                author={curItem.name}
                                                scheme={normalized_scheme?.at(0) || ""}
                                                articleRatings={articleRatingData.at(0)?.ratings || []}
                                            />
                                        </Stack>
        
                                    </Stack>)
                                    :
                                    <>{"Error"}</>)
                        }
        
                    </Stack>
                    : <Typography
                        sx={{ color: "rgb(134, 142, 150)" }}>{"После клика на диаграмму здесь будет подробная информация об авторах или лабораториях"}</Typography>
                }
            </Stack>
        </Card>
    )
}

export default RatingsCard;