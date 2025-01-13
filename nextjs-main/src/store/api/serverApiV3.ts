import { api_v3_server } from "@/src/configs/apiConfig";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { HYDRATE } from "next-redux-wrapper";
import { CrutchRequest, DeepSearchRequest, DeepSearchResponse, SubjectAreasResponse, SubsetResponse } from "../types/deepSearchTypes";
import { Rose, RoseOfWinds } from "../types/sdResultTypes";
import { CrutchScienceObject, CrutchScienceObjectAuthors, CrutchScienceObjectParams, CrutchScienceObjectPubls, PublicationsTypes, SearchApiModelRequest, SearchResponseCard, TotalCount } from "../types/searchApiType";

export const serverApiV3 = createApi({
    reducerPath: "serverApiV3",
    baseQuery: fetchBaseQuery({
        baseUrl: api_v3_server
    }),
    extractRehydrationInfo(action, { reducerPath }) {
        if (action.type === HYDRATE) {
            return action.payload[reducerPath];
        }
    },
    tagTypes: [],
    endpoints: (builder) => ({
        getPublicationsTypes: builder.query<{types: PublicationsTypes[]}, void>({
            query: () => ({ url: `/demo/get_publications_types` }),
        }),
        postSearchApiSearch: builder.mutation<SearchResponseCard, SearchApiModelRequest>({
            query: (searchParams) => ({
                url: `/demo/searchv2`,
                method: 'POST',
                body: searchParams,
            }),
        }),
        getPublInfo: builder.query({
            query: (id) => ({
                url: `/demo/get_publ_info`,
                params: { id },
            }),
        }),
        getAuthorInfo: builder.query({
            query: (id) => ({
                url: `/demo/get_author_info`,
                params: { id },
            }),
        }),
        getJournalInfo: builder.query<CrutchScienceObject, number>({
            query: (id) => ({
                url: `/demo/get_journal_info`,
                params: { id },
            }),
        }),
        getConferenceInfo: builder.query<CrutchScienceObject, number>({
            query: (id) => ({
                url: `/demo/get_conference_info`,
                params: { id },
            }),
        }),
        getConferenceAuthor: builder.query<CrutchScienceObjectAuthors, CrutchScienceObjectParams>({
            query: (params) => ({
                url: `cards/conference/get_publications`,
                params: params,
            }),
        }),
        getConferencePubl: builder.query<CrutchScienceObjectPubls, CrutchScienceObjectParams>({
            query: (params) => ({
                url: `cards/conference/get_authors`,
                params: params,
            }),
        }),
        getJournalAuthor: builder.query<CrutchScienceObjectAuthors, CrutchScienceObjectParams>({
            query: (params) => ({
                url: `cards/journal/get_authors`,
                params: params,
            }),
        }),
        getJournalPubl: builder.query<CrutchScienceObjectPubls, CrutchScienceObjectParams>({
            query: (params) => ({
                url: `/cards/journal/get_publications`,
                params: params,
            }),
        }),
        /*
        getTotalCount: builder.query<TotalCount, void>({
            query: () => ({url: `demo/get_total_count`}),
        }),
        */
        getTotalCount: builder.query<TotalCount, void>({
            query: () => ({url: `https://kb-isand.ipu.ru/deliver/get_total_count`}),
        }),
        getDeepSearchSubjectAreas: builder.query<SubjectAreasResponse, void>({
            query: () => `/demo/get_sections`,
        }),
        postDeepSearchSubset: builder.query<SubsetResponse, CrutchRequest>({
            query: (terms) => ({
                url: `/demo/get_subset_terms`,
                method: 'POST',
                body: terms,
            }),
        }),
        postDeepSearchSearch: builder.mutation<DeepSearchResponse, DeepSearchRequest>({
            query: (subfactors) => ({
                url: `/demo/thematic_searchv2`,
                method: 'POST',
                body: subfactors,
            }),
        }),
        postRoseOfWinds: builder.mutation<Rose, RoseOfWinds>({
            query: (roseOfWinds) => ({
                url: `/demo/get_rose_of_winds`,
                method: 'POST',
                body: roseOfWinds,
            }),
        }),
    }),
});

export const {
    useGetPublInfoQuery,
    useGetDeepSearchSubjectAreasQuery,
    usePostDeepSearchSubsetQuery,
    usePostDeepSearchSearchMutation,
    usePostSearchApiSearchMutation,
    usePostRoseOfWindsMutation,
    useGetAuthorInfoQuery,
    useGetPublicationsTypesQuery,
    useGetConferenceInfoQuery,
    useGetJournalInfoQuery,
    useGetConferenceAuthorQuery,
    useGetConferencePublQuery,
    useGetJournalAuthorQuery,
    useGetJournalPublQuery,
    useGetTotalCountQuery,
    util: {getRunningQueriesThunk}
} = serverApiV3

// Export hooks for usage in functional components
export const { 
    getPublicationsTypes,
    postSearchApiSearch,
    getPublInfo,
    getAuthorInfo, 
    getDeepSearchSubjectAreas, 
    postDeepSearchSubset,
    postRoseOfWinds,
} = serverApiV3.endpoints;