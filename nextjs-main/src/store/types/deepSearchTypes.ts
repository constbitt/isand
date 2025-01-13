
export type SortBy = 'desc' | 'asc'
export type SortCard = 'alphabetical' | 'popularity'

export interface DataCells {
    name: string;
    value: number;
    color: string;
    id: number
}

export interface DeepsearchItem {
    id: number
    parent_id: number
    name: string
    cut_off?: number[]
    have_child?: boolean
}

export interface SubjectArea extends DeepsearchItem {
    total_terms: number
}

export interface SubjectAreasResponse {
    subject_areas: SubjectArea[]
    total_hits: number
}

export interface SubsetResponse {
    subset: DeepsearchItem[]
    total_hits: number
}

export interface CrutchRequest {
    terms: number[]
    level: number
}

export interface Phrases {
    id: number, 
    name: string, 
    cut_off: number[]
}

export interface DeepSearchRequest {
    search_field: string
    phrases: Omit<Phrases, 'id'>[] | Omit<Phrases, 'name'>[]
    sort_by: SortBy
    sort_type: string
    offset?: number
    time_range?: number[]
}

export interface DeepSearchResponse {
    total_hits: number
    hits: Hits[]
    offset: number
    scroll_id?: string
}

export interface Hits {
    name: string
    id: number
    terms: {
        term: string
        count: number
    }[]
}

export interface DragNdDropBox {
    subject_areas: SubjectArea[]
    factors: DeepsearchItem[]
    subfactors: DeepsearchItem[]
    terms: DeepsearchItem[]

    subject_areas_box: SubjectArea[]
    factors_box: DeepsearchItem[]
    subfactors_box: DeepsearchItem[]
    terms_box: DeepsearchItem[]

    switchSubjectAreas: SortCard
    switchFactors: SortCard
    switchSubfactors: SortCard
    switchTerms: SortCard

    isFirstRender: boolean
}