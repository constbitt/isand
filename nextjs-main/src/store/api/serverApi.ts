import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {HYDRATE} from "next-redux-wrapper";
import {api_server} from "@/src/configs/apiConfig";
import {
    Author,
    AuthorsPostsPreparedResponseItem,
    AuthorsPostsRequest,
    ProduceAuthorPublicationsCountRequest,
    ProduceAuthorPublicationsCountResponse
} from "@/src/store/types/authorTypes";
import {Path} from "@/src/store/types/pathTypes";
import {RatingsRequest, RatingsResponseItem} from "@/src/store/types/ratingsTypes";
import {
    PostsForGraphRequest,
    PostsForGraphResponse,
    PostsForGraphResponsePreparedItem
} from "@/src/store/types/postsForGraphTypes";
import {
    ArticleRatingRequest,
    ArticleRatingResponse,
    ArticleRatingResponsePreparedItem
} from "@/src/store/types/articleRatingTypes";
import {preparePostForGraphResponse} from "@/src/tools/postsForGraphTool";
import {prepareArticleRatingResponse} from "@/src/tools/articleRatingTool";
import {ErrorType} from "@/src/store/types/apiTypes";
import axios from "axios";
import {TranslateIdRequest, TranslateIdResponse} from "@/src/store/types/translateTypes";
import {ProduceConnectivityGraphRequest, ProduceConnectivityGraphResponse} from "@/src/store/types/graphsTypes";

export const serverApi = createApi({
    reducerPath: "serverApi",
    baseQuery: fetchBaseQuery({
        baseUrl: api_server,
    }),
    extractRehydrationInfo(action, {reducerPath}) {
        if (action.type === HYDRATE) {
            return action.payload[reducerPath];
        }
    },
    tagTypes: [],
    endpoints: (builder) => ({
        getAuthors: builder.query<Author[], void>({
            queryFn: async arg => {
                try {
                    const baseQueryReturnValue = await axios.get<{ [_: string]: string }>(`${api_server}/authors`)

                    return {
                        data: Object.entries(baseQueryReturnValue.data).map(([id, value]) => {
                            return {id, value} as Author;
                        })
                    }
                } catch (error) {
                    return {error: {status: 0, data: String(error)}}
                }
            }
        }),
        getPath: builder.query<Path[], { level: number }>({
            query: (arg) => `/pathes?level=${arg.level}`
        }),
        getRatings: builder.query<RatingsResponseItem[], RatingsRequest>({
            query: (arg) => `/raitings?path=${arg.path}&type=${arg.type}`
        }),
        getPostsForGraph: builder.mutation<PostsForGraphResponsePreparedItem[], PostsForGraphRequest>({
            query: (arg) => ({
                url: "/posts_for_graph",
                method: "POST",
                body: arg,
            }),
            transformResponse: (baseQueryReturnValue: PostsForGraphResponse) => {
                return preparePostForGraphResponse(baseQueryReturnValue)
            }
        }),
        getArticleRating: builder.mutation<ArticleRatingResponsePreparedItem[], ArticleRatingRequest>({
            query: (arg) => ({
                url: "/articleRaiting",
                method: "POST",
                body: arg,
            }),
            transformResponse: (baseQueryReturnValue: ArticleRatingResponse) => {
                return prepareArticleRatingResponse(baseQueryReturnValue)
            }
        }),
        getAuthorsPosts: builder.query<AuthorsPostsPreparedResponseItem[], AuthorsPostsRequest>({
            queryFn: async (arg, api, extraOptions, baseQuery) => {
                const res: AuthorsPostsPreparedResponseItem[] = []
                const promiseArr = []
                try {

                    for (const author of arg.authors) {
                        promiseArr.push(baseQuery(`/authors_posts?author_id=${author.author_id}`))
                    }

                    const respAll = await Promise.all(promiseArr)

                    for (const resp of respAll) {
                        if (resp.error) {
                            return {error: resp.error}
                        }

                        if (!resp.data) {
                            return {error: {status: 0, data: "Null response"}}
                        }

                        res.push(...Object.entries(resp.data).map(([id, name]) => {
                            return {
                                id, name
                            } as AuthorsPostsPreparedResponseItem
                        }))
                    }
                    return {data: res}
                } catch (error) {
                    return {error} as ErrorType
                }
            }
        }),
        translateId: builder.mutation<TranslateIdResponse, TranslateIdRequest>({
            query: (arg) => ({
                url: "/translate_id",
                method: "POST",
                body: arg,
            }),
        }),
        produceAuthorPublicationsCount: builder.mutation<ProduceAuthorPublicationsCountResponse, ProduceAuthorPublicationsCountRequest>({
            query: (arg) => ({
                url: "/produce_author_publications_count",
                method: "POST",
                body: arg
            })
        }),
        produceConnectivityGraph: builder.mutation<ProduceConnectivityGraphResponse, ProduceConnectivityGraphRequest>({
            query: (arg) => ({
                url: "/produce_connectivity_graph",
                method: "POST",
                body: arg
            }),
        })
    }),
});

// Export hooks for usage in functional components
export const {
    useProduceConnectivityGraphMutation,
    useProduceAuthorPublicationsCountMutation,
    useGetArticleRatingMutation,
    useGetPostsForGraphMutation,
    useGetPathQuery,
    useGetRatingsQuery,
    useGetAuthorsPostsQuery,
    useTranslateIdMutation,
    util: {getRunningQueriesThunk},
} = serverApi;

// export endpoints for use in SSR
export const {getAuthors, getPath, getRatings} = serverApi.endpoints;