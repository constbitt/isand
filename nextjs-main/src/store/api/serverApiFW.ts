import { api_fw_server } from "@/src/configs/apiConfig";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { HYDRATE } from "next-redux-wrapper";

type PrndDataItem = [string, number, number];

export const serverApiFW = createApi({
    reducerPath: "serverApiFW",
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NODE_ENV === 'development' ? '/api' : api_fw_server
    }),
    extractRehydrationInfo(action, { reducerPath }) {
        if (action.type === HYDRATE) {
            return action.payload[reducerPath];
        }
    },
    tagTypes: [],
    endpoints: (builder) => ({
        getPrndData: builder.query<PrndDataItem[], void>({
            query: () => ({
                url: '/get_link_source',
                params: {
                    source_name: 'prnd'
                }
            })
        })
    }),
});

export const { useGetPrndDataQuery } = serverApiFW;

