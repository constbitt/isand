
export interface SearchApiModel {
    phrase: string
    sort_type: string
    search_field: string
    sort_by: string
    p_type: number[]
    time_range: number[]
}

export interface SearchApiModelRequest extends SearchApiModel {
    offset: number
}

export interface MiniCard {
    id: number
    name: string
    add_info: string[]
    affiliation: string
}

export interface SearchResponseCard {
    hits: MiniCard[]
    total_hits: number
    offset: number
}

export interface PublicationsTypes {
    id: number    
    name: string
}

export interface Ids {
    name: string
    id: string
}

export interface Author {
    avatar: string
    fio: string
    affiliation: string
    description: string
    geoposition: string
    publications: number
    citations: number
    ids: Ids[]
}

export interface CrutchScienceObject {
    name: string
    total_publications: number
}

export interface CrutchScienceObjectAuthors {
    total_count: number
    authors: Ids[]
}

export interface CrutchScienceObjectPubls {
    total_count: number
    publications: Ids[]
}

export interface CrutchScienceObjectParams {
    offset: number
    id: number
    phrases: string | null
}

export interface TotalCount {
    publications: number
    authors: number
}