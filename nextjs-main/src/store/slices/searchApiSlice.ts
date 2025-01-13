import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "@/src/store/store";
import {SearchApiModel} from "@/src/store/types/searchApiType";


export const initialState: SearchApiModel = {
    phrase: '',
    sort_type: 'relevance',
    search_field: 'publications',
    sort_by: 'desc',
    p_type: [],
    time_range: [1997, new Date().getFullYear()],
}

export const searchApiSlice = createSlice({
    name: "search_api",
    initialState: initialState,
    reducers: {
        setPhrase: (state, action: PayloadAction<string>) => {
            state.phrase = action.payload
        },
        setSortType: (state, action: PayloadAction<string>) => {
            state.sort_type = action.payload
        },
        setSearchFields: (state, action: PayloadAction<string>) => {
            state.search_field = action.payload
        },
        setSortBy: (state, action: PayloadAction<string>) => {
            state.sort_by = action.payload
        },
        setPType: (state, action: PayloadAction<number[]>) => {
            state.p_type = action.payload
        },
        setTimeRange: (state, action: PayloadAction<number[]>) => {
            state.time_range = action.payload
        },
    }
})

export const {
    setPhrase,
    setSortType,
    setSearchFields,
    setSortBy,
    setPType,
    setTimeRange,
} = searchApiSlice.actions

export const selectPhrase = (state: RootState): string => state.search_api.phrase
export const selectSortType = (state: RootState): string => state.search_api.sort_type
export const selectTimeRange = (state: RootState): number[] => state.search_api.time_range
export const selectSearchFields = (state: RootState): string => state.search_api.search_field
export const selectSortBy = (state: RootState): string => state.search_api.sort_by
export const selectPType = (state: RootState): number[] => state.search_api.p_type
export const selectSearchApiRequest = (state: RootState): SearchApiModel => state.search_api