import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {HYDRATE} from "next-redux-wrapper";
import {api_server, api_v2_server} from "@/src/configs/apiConfig";
import {Laboratory} from "@/src/store/types/laboratoryTypes";
import axios from "axios";
import {Author} from "@/src/store/types/authorTypes";
import {YearsRangeRequest, YearsRangeResponseItem} from "@/src/store/types/yearsRangeTypes";

export const serverApiV2 = createApi({
    reducerPath: "serverApiV2",
    baseQuery: fetchBaseQuery({
        baseUrl:  api_v2_server,
    }),
    extractRehydrationInfo(action, {reducerPath}) {
        if (action.type === HYDRATE) {
            return action.payload[reducerPath];
        }
    },
    tagTypes: [],
    endpoints: (builder) => ({
        getOrganization: builder.query<
            Laboratory[],
            void
        >({
            // query: () => ({url: `organization?id=1`, method: "GET"}),
            queryFn: async arg => {
                try {
                    const baseQueryReturnValue = await axios.get<Laboratory[]>(`${api_v2_server}/organization?id=1`)

                    return {data : baseQueryReturnValue.data}
                }
                catch (error) {
                    return {error : {status : 0, data: String(error)}}
                }
            }

        }),

        getYearsRange: builder.query<YearsRangeResponseItem[], YearsRangeRequest>({
            query: arg => ({
                url: "/authors/get_min_max_year",
                method: "GET",
                params: arg
            })
        })
    }),
});

// Export hooks for usage in functional components
export const {
    useGetOrganizationQuery,
    useGetYearsRangeQuery,
    util: {getRunningQueriesThunk},
} = serverApiV2;

// export endpoints for use in SSR
export const {getOrganization} = serverApiV2.endpoints;