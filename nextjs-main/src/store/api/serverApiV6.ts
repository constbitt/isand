import { api_v4_server } from "@/src/configs/apiConfig";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { HYDRATE } from "next-redux-wrapper";
import Cookies from 'js-cookie';
import { GrobidCorrect, GrobidPubl, ModeratePages, OrgData, OrgSetting, OrganizationReg, PersonHat, PersonalityData, Setting } from "../types/personalityTypes";
import { AuthToken } from "../types/authorizationTypes";
import { setHeaderInfo } from "../slices/headerModalSlice";
console.log("serverApiV6 loaded");

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
    tagTypes: ['Auth'], 
    extractRehydrationInfo(action, { reducerPath }) {
        if (action.type === HYDRATE) {
            return action.payload[reducerPath];
        }
    },
    endpoints: (builder) => ({
        postAccountApiRegisterUser: builder.mutation<{ message: string; user_id: number }, any>({
            query: (userData) => ({
                url: `/register/user/`,
                method: 'POST',
                body: userData,
            }),
            invalidatesTags: ['Auth'],
        }),
        postAccountApiLoginUser: builder.mutation<{ token: string; avatar: string; fio: string }, { main_email: string; password: string }>({
            query: (credentials) => ({
                url: `/login/`,
                method: 'POST',
                body: credentials,
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    Cookies.set('token', data.token, { expires: 7 });
                    dispatch(setHeaderInfo({
                        header_avatar_url: data.avatar,
                        header_fio: data.fio,
                        authorization: true,
                    }));
                } catch (err) {
                    console.error('Login error:', err);
                }
            },
            invalidatesTags: ['Auth'],
        }),
    }),
});


export const {
    usePostAccountApiRegisterUserMutation,
    usePostAccountApiLoginUserMutation,

    util: {getRunningQueriesThunk}
} = serverApiV6

export const {
    postAccountApiRegisterUser,
    postAccountApiLoginUser,
} = serverApiV6.endpoints;