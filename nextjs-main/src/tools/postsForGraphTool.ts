import {PostsForGraphResponse, PostsForGraphResponsePreparedItem} from "@/src/store/types/postsForGraphTypes";
import {descendingComparatorByField} from "@/src/tools/arrayTool";

export const preparePostForGraphResponse = (originValue: PostsForGraphResponse) => {
    const new_resp: PostsForGraphResponsePreparedItem[] = []

    Object.entries(originValue).forEach(([key1, value1]) => {

        new_resp.push({
            author: key1,
            terms: Object.entries(value1).map(([value, count]) => {
                return {value, count}
            }).sort(descendingComparatorByField("count"))
        })

    })
    return new_resp;
}