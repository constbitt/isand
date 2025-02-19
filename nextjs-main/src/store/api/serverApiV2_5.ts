import { api_v2_5_server } from "@/src/configs/apiConfig";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { HYDRATE } from "next-redux-wrapper";
import { Publication } from './types';

export const serverApiV2_5 = createApi({
    reducerPath: "serverApiV2_5",
    baseQuery: fetchBaseQuery({
        baseUrl: api_v2_5_server
    }),
    extractRehydrationInfo(action, { reducerPath }) {
        if (action.type === HYDRATE) {
            return action.payload[reducerPath];
        }
    },
    tagTypes: [],
    endpoints: (builder) => ({
        getPublInfo: builder.query<Publication[], string | number>({
            query: (prnd) => ({
                url: `/publications/search`,
                params: { prnd },
            }),
        }),
        getAuthorInfo: builder.query<any[], number>({
            query: (id) => `/authors/card/get_info?id=${id}`,
        }),
        getAuthorJournals: builder.query<any[], number>({
            query: (id) => `/authors/card/get_journals?id=${id}`,
        }),
        getAuthorConferences: builder.query<any[], number>({
            query: (id) => `/authors/card/get_conferences?id=${id}`,
        }),
        getAuthorByIsandId: builder.query<any, number>({
            query: (id) => `/authors/search?id=${id}`,
        }),
        getAuthorByPrnd: builder.query<any, number>({
            query: (prnd) => `/authors/search?prnd=${prnd}`,
        }),
        getAuthorByFio: builder.query<any, string>({
            query: (fio) => `authors/search?fio=${fio}`,
        }),
        getPublicationsByAuthorId: builder.query({
            query: (id) => `authors/card/get_publications?id=${id}`,
        }),
        getAuthorsActivity: builder.query({
            query: (id) => `authors/analysis/get_activity?id=${id}&begin_year=1900`,
        }),
        getPublIsandInfo: builder.query<Publication[], string | number>({
            query: (id) => ({
                url: `/publications/search`,
                params: { id },
            }),
        }),
        searchPublications: builder.query<any[], { type: string, all_text: string }>({
            query: ({ type, all_text }) => 
                `publications/search?type=${encodeURIComponent(type)}&all_text=${encodeURIComponent(all_text)}`
        }),
        searchPublByTitle: builder.query<any[], { type: string, title: string }>({
            query: ({ type, title }) => 
                `publications/search?title=${encodeURIComponent(title)}`
        }),
        getPublCardInfo: builder.query<Publication[], string | number>({
            query: (id) => ({
                url: `/publications/card/get_info`,
                params: { id },
            }),
        }),
        getPublByFileStoreId: builder.query<any[], string | number>({
            query: (file_store) => ({
                url: `/publications/search`,
                params: { file_store },
            }),
        }),
        getOrgInfo: builder.query<any[], number>({
            query: (id) => `/organizations/search?id=${id}`,
        }),
        getConferenceInfo: builder.query<any, number>({
            query: (id) => `/conferences/search?id=${id}`,
        }),
        getJournalInfo: builder.query<any, number>({
            query: (id) => `/journals/card/get_info?id=${id}`,
        }),
        getJournalByNameInfo: builder.query<any, string>({
            query: (name) => `/journals/search?name=${name}`,
        }),
        getConferenceCardInfo: builder.query<any, number>({
            query: (id) => `/conferences/card/get_info?id=${id}`,
        }),
        getConferenceByNameInfo: builder.query<any, string>({   
            query: (name) => `/conferences/search?name=${name}`,
        }),
        getOrgCardInfo: builder.query<any[], number>({
            query: (id) => `/organizations/card/get_info?id=${id}`,
        }),
        getOrgAuthors: builder.query<any[], number>({
            query: (id) => `/organizations/card/get_authors?id=${id}`,
        }),
        getOrgPublications: builder.query<any[], number>({
            query: (id) => `/organizations/card/get_publications?id=${id}`,
        }),
        getJournalAuthors: builder.query<any[], number>({
            query: (id) => `/journals/card/get_authors?id=${id}`,
        }),
        getJournalPublications: builder.query<any[], number>({
            query: (id) => `/journals/card/get_publications?id=${id}`,
        }),
        getConferenceAuthors: builder.query<any[], number>({
            query: (id) => `/conferences/card/get_authors?id=${id}`,
        }),
        getConferencePublications: builder.query<any[], number>({
            query: (id) => `/conferences/card/get_publications?id=${id}`,
        }),
    }),
});

export const {
    useGetPublInfoQuery,
    useGetAuthorInfoQuery,
    useGetAuthorJournalsQuery,
    useGetAuthorConferencesQuery,
    useGetAuthorByIsandIdQuery,
    useGetAuthorByPrndQuery,
    useGetAuthorByFioQuery,
    useGetPublicationsByAuthorIdQuery,
    useGetAuthorsActivityQuery,
    useGetPublIsandInfoQuery,
    useSearchPublicationsQuery,
    useSearchPublByTitleQuery,
    useGetPublCardInfoQuery,
    useGetPublByFileStoreIdQuery,
    useGetOrgInfoQuery,
    useGetConferenceInfoQuery,
    useGetJournalInfoQuery,
    useGetJournalByNameInfoQuery,
    useGetConferenceCardInfoQuery,
    useGetConferenceByNameInfoQuery,
    useGetOrgCardInfoQuery,
    useGetOrgAuthorsQuery,
    useGetOrgPublicationsQuery,
    useGetJournalAuthorsQuery,
    useGetJournalPublicationsQuery,
    useGetConferenceAuthorsQuery,
    useGetConferencePublicationsQuery,
    util: { getRunningQueriesThunk }
} = serverApiV2_5;