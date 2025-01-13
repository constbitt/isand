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
        getAuthorJournals: builder.query<any[], number>({
            query: (id) => `/authors/card/get_journals?id=${id}`,
        }),
        getAuthorConferences: builder.query<any[], number>({
            query: (id) => `/authors/card/get_conferences?id=${id}`,
        }),
        getAuthorByPrnd: builder.query<any, number>({
            query: (prnd) => `/authors/search?prnd=${prnd}`,
        }),
        getPublicationsByAuthorId: builder.query({
            query: (id) => `authors/card/get_publications?id=${id}`,
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
        getPublCardInfo: builder.query<Publication[], string | number>({
            query: (id) => ({
                url: `/publications/card/get_info`,
                params: { id },
            }),
        }),
    }),
});

export const {
    useGetPublInfoQuery,
    useGetAuthorJournalsQuery,
    useGetAuthorConferencesQuery,
    useGetAuthorByPrndQuery,
    useGetPublicationsByAuthorIdQuery,
    useGetPublIsandInfoQuery,
    useSearchPublicationsQuery,
    useGetPublCardInfoQuery,
    util: { getRunningQueriesThunk }
} = serverApiV2_5;