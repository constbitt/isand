import {Author} from "@/src/store/types/authorTypes";

export interface ThesaurusState {
    author : Author | null | undefined,
    section : string,
    highlight_mode: string
    parent_term : string | undefined | null,
    parent_level: number,
    highlight_term: string | undefined | null,
    display_terms: boolean
}

export interface SubjectArea {
    id: number
    name: string
    id_parent?: number
}

export interface Item {
    id: number
    id_parent: number
    name: string
}