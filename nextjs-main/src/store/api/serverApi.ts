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
        getJournals: builder.query<Author[], void>({
            queryFn: async arg => {
                try {
                    const baseQueryReturnValue = await axios.get<{ [_: string]: string }>(`${api_server}/journals`)

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
        getConferences: builder.query<Author[], void>({
            queryFn: async arg => {
                try {
                    const baseQueryReturnValue = await axios.get<{ [_: string]: string }>(`${api_server}/conferences`)

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
        getOrganizations: builder.query<Author[], void>({
            queryFn: async arg => {
                try {
                    const baseQueryReturnValue = await axios.get<{ [_: string]: string }>(`${api_server}/organizations`)

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
        getCities: builder.query<Author[], void>({
            queryFn: async arg => {
                try {
                    const baseQueryReturnValue = await axios.get<{ [_: string]: string }>(`${api_server}/cities`)

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
            query: (arg) => `/raitings?path=${arg.path}&type=${arg.type}&show_all=${true}`
        }),
        downloadAuthorData: builder.query<String, {author_id: number | string}> ({
            query: (arg) => `/download_author_data?author_id=${arg.author_id}`
        }),
        checkDownloadStatus: builder.query<String, void>({
            query: () => '/check_download_status',
          }),          
        getMetrics: builder.query<any, { author_id: number; factor_level: number; k1_coefficient: number }>({
            queryFn: async (arg) => {
                const response = await fetch(`${api_server}/calculate_smm?author_id=${arg.author_id}&factor_level=${arg.factor_level}&k1_coefficient=${arg.k1_coefficient}`);
                const text = await response.text();
                return { data: text };
            }
        }),  
        getPostsForGraph: builder.mutation<PostsForGraphResponsePreparedItem[], PostsForGraphRequest>({
            query: (arg) => {
                return {
                    url: "/posts_for_graph",
                    method: "POST",
                    body: arg,
                };
            },
            transformResponse: (baseQueryReturnValue: PostsForGraphResponse) => {
                return preparePostForGraphResponse(baseQueryReturnValue);
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
        getJournalsPosts: builder.query<AuthorsPostsPreparedResponseItem[], AuthorsPostsRequest>({
            queryFn: async (arg, api, extraOptions, baseQuery) => {
                const res: AuthorsPostsPreparedResponseItem[] = []
                const promiseArr = []
                try {

                    for (const author of arg.authors) {
                        promiseArr.push(baseQuery(`/journals_posts?journals_id=${author.author_id}`))
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
        getConferencesPosts: builder.query<AuthorsPostsPreparedResponseItem[], AuthorsPostsRequest>({
            queryFn: async (arg, api, extraOptions, baseQuery) => {
                const res: AuthorsPostsPreparedResponseItem[] = []
                const promiseArr = []
                try {

                    for (const author of arg.authors) {
                        promiseArr.push(baseQuery(`/conferences_posts?conference_id=${author.author_id}`))
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
        getCitiesPosts: builder.query<AuthorsPostsPreparedResponseItem[], AuthorsPostsRequest>({
            queryFn: async (arg, api, extraOptions, baseQuery) => {
                const res: AuthorsPostsPreparedResponseItem[] = []
                const promiseArr = []
                try {

                    for (const author of arg.authors) {
                        promiseArr.push(baseQuery(`/city_posts?cities_id=${author.author_id}`))
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
        getOrganizationsPosts: builder.query<AuthorsPostsPreparedResponseItem[], AuthorsPostsRequest>({
            queryFn: async (arg, api, extraOptions, baseQuery) => {
                const res: AuthorsPostsPreparedResponseItem[] = []
                const promiseArr = []
                try {

                    for (const author of arg.authors) {
                        promiseArr.push(baseQuery(`/organization_posts?organizations_id=${author.author_id}`))
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
        }),
        filterIds: builder.mutation<any, { ids: number[]; targets: string[] }>({
            query: (arg) => ({
                url: "/filter_ids",
                method: "POST",
                body: arg,
            }),
        }),

        filterIdsAnnotations: builder.mutation<any, { ids: number[]; targets: string[] }>({
            query: (arg) => ({
                url: "/filter_ids_annotations",
                method: "POST",
                body: arg,
            }),
        }),
        convertId: builder.query<any, { id: number }>({
            query: (arg) => `/convert_id?id=${arg.id}&source_id=account_db_b&target_id=prnd`,
        }),

        getPathAnnotations: builder.query<Path[], { level: number }>({
            query: (arg) => `/pathes_annotations?level=${arg.level}`
        }),
        getRatingsAnnotations: builder.query<RatingsResponseItem[], RatingsRequest>({
            query: (arg) => `/raitings_annotations?path=${arg.path}&type=${arg.type}&show_all=${true}`
        }),
        downloadAuthorDataAnnotations: builder.query<String, {author_id: number | string}> ({
            query: (arg) => `/download_author_data_annotations?author_id=${arg.author_id}`
        }),     
        downloadSingleAuthorDataAnnotations: builder.query<String, {author_id: number | string}> ({
            query: (arg) => `/download_single_author_annotation_data?author_id=${arg.author_id}`
        }),      
        getMetricsAnnotations: builder.query<any, { author_id: number; factor_level: number; k1_coefficient: number }>({
            queryFn: async (arg) => {
                const response = await fetch(`${api_server}/calculate_smm_annotations?author_id=${arg.author_id}&factor_level=${arg.factor_level}&k1_coefficient=${arg.k1_coefficient}`);
                const text = await response.text();
                return { data: text };
            }
        }),
        getPostsForGraphAnnotations: builder.mutation<PostsForGraphResponsePreparedItem[], PostsForGraphRequest>({
            query: (arg) => {
                return {
                    url: "/posts_for_graph_annotations",
                    method: "POST",
                    body: arg,
                };
            },
            transformResponse: (baseQueryReturnValue: PostsForGraphResponse) => {
                return preparePostForGraphResponse(baseQueryReturnValue);
            }
        }),
        getArticleRatingAnnotations: builder.mutation<ArticleRatingResponsePreparedItem[], ArticleRatingRequest>({
            query: (arg) => ({
                url: "/articleRaiting_annotations",
                method: "POST",
                body: arg,
            }),
            transformResponse: (baseQueryReturnValue: ArticleRatingResponse) => {
                return prepareArticleRatingResponse(baseQueryReturnValue)
            }
        }),

        extractPdfText: builder.mutation<any, File>({
            query: (file) => {
                const formData = new FormData();
                formData.append("file", file);

                return {
                    url: "/extract_pdf_text",
                    method: "POST",
                    body: formData,
                };
            },
    }),

    }),
});

export const {
    useProduceConnectivityGraphMutation,
    useProduceAuthorPublicationsCountMutation,
    useGetArticleRatingMutation,
    useGetPostsForGraphMutation,
    useGetPathQuery,
    useGetRatingsQuery,
    useDownloadAuthorDataQuery,
    useCheckDownloadStatusQuery,
    useGetMetricsQuery,
    useGetAuthorsPostsQuery,
    useGetJournalsPostsQuery,
    useGetConferencesPostsQuery,
    useGetCitiesPostsQuery,
    useGetOrganizationsPostsQuery,
    useTranslateIdMutation,
    useFilterIdsMutation,
    useConvertIdQuery,
    useDownloadAuthorDataAnnotationsQuery,
    useDownloadSingleAuthorDataAnnotationsQuery,
    useFilterIdsAnnotationsMutation,
    useGetArticleRatingAnnotationsMutation,
    useGetPathAnnotationsQuery,
    useGetMetricsAnnotationsQuery,
    useGetPostsForGraphAnnotationsMutation,
    useGetRatingsAnnotationsQuery,
    useGetOrganizationsQuery,
    useExtractPdfTextMutation,
    util: {getRunningQueriesThunk},
} = serverApi;

// export endpoints for use in SSR
export const {getAuthors, getJournals, getConferences, getOrganizations, getCities, getPath, getPathAnnotations, getRatings, getMetrics} = serverApi.endpoints;