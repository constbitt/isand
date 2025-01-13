import {ArticleRatingResponse, ArticleRatingResponsePreparedItem} from "@/src/store/types/articleRatingTypes";
import {descendingComparatorByField} from "@/src/tools/arrayTool";

export const prepareArticleRatingResponse = (originValue: ArticleRatingResponse) => {

    const new_resp: ArticleRatingResponsePreparedItem[] = []

    Object.entries(originValue).forEach(([key1, value1]) => {
        new_resp.push({
            author: key1,
            ratings: value1.map((item) => {

                const [key2, value2] = Object.entries(item)[0]
                return {
                    value: key2, count: value2
                }
            }).sort(descendingComparatorByField("count"))
        })
    })
    return new_resp

}