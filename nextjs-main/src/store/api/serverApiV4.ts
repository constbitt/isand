import { api_v4_server } from "@/src/configs/apiConfig";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { HYDRATE } from "next-redux-wrapper";
import { Authorization, AuthorizationResponse, Registration } from "../types/authorizationTypes";

export const serverApiV4 = createApi({
    reducerPath: "serverApiV4",
    baseQuery: fetchBaseQuery({
        baseUrl: api_v4_server,
    }),
    extractRehydrationInfo(action, { reducerPath }) {
        if (action.type === HYDRATE) {
            return action.payload[reducerPath];
        }
    },
    tagTypes: [],
    endpoints: (builder) => ({
        postAccountApiAuth: builder.mutation<AuthorizationResponse, Authorization>({
            query: (authParams) => ({
                url: `/login`,
                method: 'POST',
                body: authParams,
            }),
        }),
        postAccountApiReg: builder.mutation<null, Registration>({
            query: (regParams) => ({
                url: `/register/user`,
                method: 'POST',
                body: regParams,
            }),
        }),
        getAccountApiAffiliation: builder.query<string[], void>({
            query: () => `/get_affiliation_for_register`,
        }),
        getAccountApiCities: builder.query<string[], void>({
            query: () => `/get_cities`,
        }),
        getAccountApiJobTitle: builder.query<string[], void>({
            query: () => `/get_roles`,
        }),
        getAccountApiCountries: builder.query<string[], void>({
            query: () => `/get_countries`,
        }),
    }),
});

export const {
    usePostAccountApiAuthMutation,
    usePostAccountApiRegMutation,
    useGetAccountApiAffiliationQuery,
    useGetAccountApiCitiesQuery,
    useGetAccountApiCountriesQuery,
    useGetAccountApiJobTitleQuery,
    util: {getRunningQueriesThunk}
} = serverApiV4

export const {
    postAccountApiAuth,
    postAccountApiReg,
    getAccountApiAffiliation,
    getAccountApiCities,
    getAccountApiCountries,
    getAccountApiJobTitle,
} = serverApiV4.endpoints;