import { api_v4_server } from "@/src/configs/apiConfig";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { HYDRATE } from "next-redux-wrapper";
import Cookies from 'js-cookie';
import { GrobidCorrect, GrobidPubl, ModeratePages, OrgData, OrgSetting, OrganizationReg, PersonHat, PersonalityData, Setting } from "../types/personalityTypes";
import { AuthToken } from "../types/authorizationTypes";
import { setHeaderInfo } from "../slices/headerModalSlice";

export const serverApiV6 = createApi({
    reducerPath: "serverApiV6",
    baseQuery: fetchBaseQuery({
        baseUrl: api_v4_server,
        prepareHeaders: (headers) => {
            const token = Cookies.get('token');
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    extractRehydrationInfo(action, { reducerPath }) {
        if (action.type === HYDRATE) {
            return action.payload[reducerPath];
        }
    },
    tagTypes: [],
    endpoints: (builder) => ({
        postAccountApiAddPersonalityData: builder.mutation<void, PersonalityData>({
            query: (personality) => ({
                url: `/add_profile_data`,
                method: 'POST',
                body: personality,
            }),
        }),
        postAccountApiAddOrgData: builder.mutation<void, OrgData>({
            query: (org_personality) => ({
                url: `/organization/add_organization_profile_data`,
                method: 'POST',
                body: org_personality,
            }),
        }),
        postAccountApiRegOrganization: builder.mutation<void, OrganizationReg>({
            query: (org) => ({
                url: `/register/organization`,
                method: 'POST',
                body: org,
            }),
        }),
        postAccountApiUploadPubl: builder.mutation<void | GrobidPubl, FormData>({
            query: (formData) => ({
                url: `/upload/upload_pub`,
                method: 'POST',
                body: formData,
            }),
        }),
        postAccountApiUploadCorrectPubl: builder.mutation<void, GrobidCorrect>({
            query: (data) => ({
                url: `/upload/upload_correct_pub`,
                method: 'POST',
                body: data,
            }),
        }),
        getAccountApiPersonData: builder.query<Setting, void>({
            query: () => `/get_profile_data`,
            keepUnusedDataFor: 0,
        }),
        getAccountApiOrgData: builder.query<OrgSetting, number>({
            query: (org_id) => ({
                url: `/organization/get_organization_profile_data`,
                params: {org_id},
            }),
            keepUnusedDataFor: 0,
        }),
        getAccountApiOrgTypes: builder.query<string[], void>({
            query: () => `/get_org_types`,
        }),
        getAccountApiPersonHat: builder.query<PersonHat, void>({
            query: () => `/profile_header`,
        }),
        getAccountApiIdUpload: builder.query<number, void>({
            query: () => `/upload/get_upload_id`,
        }),
        getAccountApiModeratePages: builder.query<ModeratePages, void>({
            query: () => `/moderate_pages`,
        }),
        getAccountApiAuthToken: builder.query<AuthToken, void>({
            query: () => `/login_with_token`,
            onQueryStarted: async (arg, {dispatch, queryFulfilled}) => {
                try {
                    const {data} = await queryFulfilled
                    dispatch(setHeaderInfo({
                        header_avatar_url: data.avatar,
                        header_fio: data.fio,
                        authorization: true,
                    }))
                } catch (e) {
                    console.error(e)
                }
            },
        }),
    }),
});

export const {
    useGetAccountApiOrgTypesQuery,
    useGetAccountApiPersonDataQuery,
    usePostAccountApiAddPersonalityDataMutation,
    usePostAccountApiRegOrganizationMutation,
    useGetAccountApiAuthTokenQuery,
    useGetAccountApiPersonHatQuery,
    useGetAccountApiModeratePagesQuery,
    usePostAccountApiUploadPublMutation,
    useLazyGetAccountApiIdUploadQuery,
    usePostAccountApiUploadCorrectPublMutation,
    useGetAccountApiOrgDataQuery,
    usePostAccountApiAddOrgDataMutation,
    util: {getRunningQueriesThunk}
} = serverApiV6

export const {
    getAccountApiOrgTypes,
    getAccountApiPersonData,
    postAccountApiAddPersonalityData,
    postAccountApiRegOrganization,
    getAccountApiAuthToken,
    getAccountApiPersonHat,
    getAccountApiModeratePages,
    postAccountApiUploadPubl,
    getAccountApiIdUpload,
    postAccountApiUploadCorrectPubl,
    getAccountApiOrgData,
    postAccountApiAddOrgData,
} = serverApiV6.endpoints;