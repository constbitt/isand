export interface PostsForGraphRequest {
    selected_authors?: string[],
    selected_journals?: string[],
    selected_conferences?: string[],
    selected_works_id: string[],
    level: number,
    selected_scheme_id: number,
    cutoff_value: number,
    cutoff_terms_value: number,
    include_common_terms: boolean,
    include_management_theory: string,
    path: string[],
    selected_type?: string,
    years?: number[]
}

export interface PostsForGraphResponse {
    [author: string]: { [term: string]: number }
}

export interface PostsForGraphResponsePreparedItem {
    author: string,
    terms: { value: string, count: number }[]
}

