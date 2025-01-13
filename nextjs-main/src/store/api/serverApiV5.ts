import { api_v5_server } from "@/src/configs/apiConfig";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { HYDRATE } from "next-redux-wrapper";
import { AllAuthorsResponse, AllAviableSource, AuthorDeltasResponse, AuthorMinMaxYearResponse, ProduceAuthorConnectivityGraphRequest, ProduceAuthorConnectivityGraphResponse, ProduceProfileMapResponse, ProduceThesaurusGraphRequst, ProduceThesaurusGraphResponse, GetAuthorDeltasRequest} from "../types/graphsTypes";
import { Item, SubjectArea } from "../types/thesaurusTypes";

export const serverApiV5 = createApi({
    reducerPath: "serverApiV5",
    baseQuery: fetchBaseQuery({
        baseUrl: api_v5_server
    }),
    extractRehydrationInfo(action, { reducerPath }) {
        if (action.type === HYDRATE) {
            return action.payload[reducerPath];
        }
    },
    tagTypes: [],
    endpoints: (builder) => ({
        getAllAviableAuthors: builder.query<AllAuthorsResponse[], void>({
            query: () => ({
                url: `/get_all_available_authors`,
            }),
        }),
        getConferenceAuthors: builder.query<string[], string>({
            query: (conf_name) => ({
                url: `/get_conf_authors`,
                params: {conf_name: conf_name}
            }),
        }),
        getAuthorMinMaxYear: builder.query<AuthorMinMaxYearResponse, number>({
            query: (auth_prnd_id) => ({
                url: `/get_author_min_max_year`,
                params: {auth_prnd_id: auth_prnd_id}
            }),
        }),
        getAuthorDeltas: builder.query<AuthorDeltasResponse[], GetAuthorDeltasRequest>({
            query: (auth_deltas_req) => ({
                url: `/get_author_deltas`,
                params: auth_deltas_req,
            }),
        }),
        postProduceAuthorConnectivityGraph: builder.mutation<ProduceAuthorConnectivityGraphResponse, ProduceAuthorConnectivityGraphRequest>({
            query: (produce_author) => ({
                url: `/produce_author_connectivity_graph`,
                method: 'POST',
                body: produce_author,
            }),
        }),
        getProduceProfileMap: builder.query<ProduceProfileMapResponse[], void>({
            query: () => ({
                url: `/produce_profile_map`,
            }),
        }),
        postProduceThesaurusGraph: builder.mutation<ProduceThesaurusGraphResponse, ProduceThesaurusGraphRequst>({
            query: (thesaurus_graph) => ({
                url: `/produce_thesaurus_graph`,
                method: 'POST',
                body: thesaurus_graph
            }),
        }),
        getAllAviableConference: builder.query<AllAviableSource[], void>({
            query: () => ({
                url: `/get_all_available_conferences`,
            }),
        }),
        getAllSubjectAreas: builder.query<SubjectArea[], void>({
            query: () => ({
                url: `/produce_classificator_roots`,
            }),
        }),
        postAllItems: builder.mutation<Item[], {root_ids: number[], lvl: number}>({
            query: (lists) => ({
                url: `/produce_classificator_subtree`,
                method: 'POST',
                body: lists,
            }),
        }),
    }),
});

export const {
    useGetAuthorDeltasQuery,
    useGetAuthorMinMaxYearQuery,
    useGetConferenceAuthorsQuery,
    useGetProduceProfileMapQuery,
    usePostProduceThesaurusGraphMutation,
    useGetAllAviableAuthorsQuery,
    usePostProduceAuthorConnectivityGraphMutation,
    useGetAllAviableConferenceQuery,
    useGetAllSubjectAreasQuery,
    usePostAllItemsMutation,
    util: {getRunningQueriesThunk}
} = serverApiV5

// Export hooks for usage in functional components
export const { 
    getAllAviableAuthors,
    getAuthorDeltas,
    getAuthorMinMaxYear,
    getConferenceAuthors,
    getProduceProfileMap,
    postProduceThesaurusGraph,
    getAllAviableConference,
    postProduceAuthorConnectivityGraph,
    getAllSubjectAreas,
    postAllItems,
} = serverApiV5.endpoints;