import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "@/src/store/store"
import {ProfilesState} from "@/src/store/types/profileTypes";
import {Author} from "@/src/store/types/authorTypes";
import {Laboratory} from "@/src/store/types/laboratoryTypes";
import {Work} from "@/src/store/types/workTypes";


const initialState: ProfilesState = {
    authors: [],
    laboratories: [],
    works: [],
    level: 1,
    terming_cutting: 0,
    category_cutting: 0,
    time_range: [1920, 2023],
    scientific_terms: false,
    thesaurus_path: [],
    graph_type: 0,
    thesaurus_available_values: []
};

export const profilesSlice = createSlice({
    name: "profiles",
    initialState: initialState,
    reducers: {
        setLevel: (state, action: PayloadAction<number>) => {
            state.level = action.payload
        },

        setCategoryCutting: (state, action: PayloadAction<number>) => {
            state.category_cutting = action.payload
        },
        setTermingCutting: (state, action: PayloadAction<number>) => {
            state.terming_cutting = action.payload
        },
        setAuthors: (state, action: PayloadAction<Author[]>) => {
            state.authors = action.payload
        },
        setLaboratories: (state, action: PayloadAction<Laboratory[]>) => {
            state.laboratories = action.payload
        },
        setWorks: (state, action: PayloadAction<Work[]>) => {
            state.works = action.payload
        },
        setTimeRange: (state, action: PayloadAction<number[]>) => {
            state.time_range = action.payload
        },
        setScientificTerms: (state, action: PayloadAction<boolean>) => {
            state.scientific_terms = action.payload
        },
        setThesaurusPath: (state, action: PayloadAction<string[]>) => {
            state.thesaurus_path = action.payload
        },
        setGraphType: (state, action: PayloadAction<number>) => {
            state.graph_type = action.payload
        },
        setThesaurusAvailableValues : (state, action: PayloadAction<string[]>) => {
            state.thesaurus_available_values = action.payload
        }
    }
})

export const {
    setLevel,
    setAuthors,
    setLaboratories,
    setCategoryCutting,
    setTermingCutting,
    setTimeRange,
    setScientificTerms,
    setThesaurusPath,
    setGraphType,
    setWorks,
    setThesaurusAvailableValues
} = profilesSlice.actions

export const selectAuthors = (state: RootState) => state.profiles.authors
export const selectLaboratories = (state: RootState) => state.profiles.laboratories
export const selectWorks = (state: RootState) => state.profiles.works
export const selectLevel = (state: RootState) => state.profiles.level
export const selectTermingCutting = (state: RootState) => state.profiles.terming_cutting
export const selectCategoriesCutting = (state: RootState) => state.profiles.category_cutting
export const selectTimeRange = (state: RootState) => state.profiles.time_range
export const selectScientificTerms = (state: RootState) => state.profiles.scientific_terms
export const selectThesaurusPath = (state: RootState) => state.profiles.thesaurus_path
export const selectGraphType = (state: RootState) => state.profiles.graph_type
export const selectThesaurusAvailableValues = (state: RootState) => state.profiles.thesaurus_available_values

