import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "@/src/store/store";
import {DeepsearchItem, DeepSearchRequest, DragNdDropBox, SubjectArea} from "@/src/store/types/deepSearchTypes";

const initialState: DragNdDropBox = {
    subject_areas: [],
    factors: [],
    subfactors: [],
    terms: [],
    
    subject_areas_box: [],
    factors_box: [],
    subfactors_box: [],
    terms_box: [],

    switchFactors: 'alphabetical',
    switchSubjectAreas: 'alphabetical',
    switchSubfactors: 'alphabetical',
    switchTerms: 'alphabetical',

    isFirstRender: true,
}

export const deepSearchSlice = createSlice({
    name: "deepSearch",
    initialState: initialState,
    reducers: {
        setSubjectAreas: (state, action: PayloadAction<SubjectArea[]>) => {
            state.subject_areas = action.payload
        },
        setFactors: (state, action: PayloadAction<DeepsearchItem[]>) => {
            state.factors = action.payload
        },
        setSubfactors: (state, action: PayloadAction<DeepsearchItem[]>) => {
            state.subfactors = action.payload
        },
        setTerms: (state, action: PayloadAction<DeepsearchItem[]>) => {
            state.terms = action.payload
        },
        setSubjectAreasBox: (state, action: PayloadAction<SubjectArea[]>) => {
            state.subject_areas_box = action.payload
        },
        setFactorsBox: (state, action: PayloadAction<DeepsearchItem[]>) => {
            state.factors_box = action.payload
        },
        setSubfactorsBox: (state, action: PayloadAction<DeepsearchItem[]>) => {
            state.subfactors_box = action.payload
        },
        setTermsBox: (state, action: PayloadAction<DeepsearchItem[]>) => {
            state.terms_box = action.payload
        },
        setSwitchSubjectAreas: (state, action: PayloadAction<'alphabetical' | 'popularity'>) => {
            state.switchSubjectAreas = action.payload
        },
        setSwitchFactors: (state, action: PayloadAction<'alphabetical' | 'popularity'>) => {
            state.switchFactors = action.payload
        },
        setSwitchSubfactors: (state, action: PayloadAction<'alphabetical' | 'popularity'>) => {
            state.switchSubfactors = action.payload
        },
        setSwitchTerms: (state, action: PayloadAction<'alphabetical' | 'popularity'>) => {
            state.switchTerms = action.payload
        },
        setIsFirstRender: (state, action: PayloadAction<boolean>) => {
            state.isFirstRender = action.payload
        },
        removeSubjectAreasBox: (state, action: PayloadAction<number>) => {
            const selectedFactors = state.factors_box.filter(factor => factor.parent_id === action.payload);
            const selectedSubfactors = state.subfactors_box.filter(subfactor => selectedFactors.some(parent => parent.id === subfactor.parent_id));
            const selectedTerms = state.terms_box.filter(term => selectedSubfactors.some(parent => parent.id === term.parent_id));
            state.subject_areas_box = state.subject_areas_box.filter(subject_area => subject_area.id !== action.payload);
            state.factors_box = state.factors_box.filter(factor => !selectedFactors.some(parent => parent.id === factor.id));
            state.subfactors_box = state.subfactors_box.filter(subfactor => !selectedSubfactors.some(parent => parent.id === subfactor.id));
            state.terms_box = state.terms_box.filter(term => !selectedTerms.some(parent => parent.id === term.id));
        },
        removeFactorsBox: (state, action: PayloadAction<number>) => {
            const selectedSubfactors = state.subfactors_box.filter(subfactor => subfactor.parent_id === action.payload)
            const selectedTerms = state.terms_box.filter(term => selectedSubfactors.some(parent => parent.id === term.parent_id))
            state.factors = [...state.factors, ...state.factors_box.filter(factor => factor.id === action.payload)]
            state.factors_box = state.factors_box.filter(factor => factor.id !== action.payload)
            state.subfactors_box = state.subfactors_box.filter(subfactor => !selectedSubfactors.some(parent => parent.id === subfactor.id));
            state.terms_box = state.terms_box.filter(term => !selectedTerms.some(parent => parent.id === term.id));
        },
        removeSubfactorsBox: (state, action: PayloadAction<number>) => {
            const selectedTerms = state.terms_box.filter(term => term.parent_id === action.payload)
            state.subfactors = [...state.subfactors, ...state.subfactors_box.filter(subfactor => subfactor.id === action.payload)]
            state.subfactors_box = state.subfactors_box.filter(subfactor => subfactor.id !== action.payload)
            state.terms_box = state.terms_box.filter(term => !selectedTerms.some(parent => parent.id === term.id));
        },
        removeTermsBox: (state, action: PayloadAction<number>) => {
            state.terms = [...state.terms, ...state.terms_box.filter(term => term.id === action.payload)]
            state.terms_box = state.terms_box.filter(term => term.id !== action.payload)
        },
        setCutOff: (state, action: PayloadAction<{id: number, cut_off: number[], lvl: number}>) => {
            const lvlBox = [state.subject_areas_box, state.factors_box, state.subfactors_box, state.terms_box]
            const itemToUpdate = lvlBox[action.payload.lvl].find(item => item.id === action.payload.id)
            if (itemToUpdate) itemToUpdate.cut_off = action.payload.cut_off
        },
        clearBox: (state) => {
            state.terms_box = []
            state.subfactors_box = []
            state.factors_box = []
            state.subject_areas_box = []
        },
    }
})

export const {
    setSubjectAreas,
    setFactors,
    setSubfactors,
    setTerms,
    setSwitchSubjectAreas,
    setSwitchFactors,
    setSwitchSubfactors,
    setSwitchTerms,
    setSubjectAreasBox,
    setFactorsBox,
    setSubfactorsBox,
    setTermsBox,
    setIsFirstRender,
    removeSubjectAreasBox,
    removeFactorsBox,
    removeSubfactorsBox,
    removeTermsBox,
    setCutOff,
    clearBox,
} = deepSearchSlice.actions

export const selectSubjectAreas = (state: RootState): SubjectArea[] => state.deepSearch.subject_areas
export const selectFatcors = (state: RootState): DeepsearchItem[] => state.deepSearch.factors
export const selectSubfactors = (state: RootState): DeepsearchItem[] => state.deepSearch.subfactors
export const selectTerms = (state: RootState): DeepsearchItem[] => state.deepSearch.terms
export const selectSubjectAreasBox = (state: RootState): SubjectArea[] => state.deepSearch.subject_areas_box
export const selectFactorsBox = (state: RootState): DeepsearchItem[] => state.deepSearch.factors_box
export const selectSubfactorsBox = (state: RootState): DeepsearchItem[] => state.deepSearch.subfactors_box
export const selectTermsBox = (state: RootState): DeepsearchItem[] => state.deepSearch.terms_box
export const selectSwitchSubjectAreas = (state: RootState): 'alphabetical' | 'popularity' => state.deepSearch.switchSubjectAreas
export const selectSwitchFactors = (state: RootState): 'alphabetical' | 'popularity' => state.deepSearch.switchFactors
export const selectSwitchSubfactors = (state: RootState): 'alphabetical' | 'popularity' => state.deepSearch.switchSubfactors
export const selectSwitchTerms = (state: RootState): 'alphabetical' | 'popularity' => state.deepSearch.switchTerms
export const selectIsFirstRender = (state: RootState): boolean => state.deepSearch.isFirstRender