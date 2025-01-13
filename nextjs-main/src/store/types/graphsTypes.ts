import {Author} from "@/src/store/types/authorTypes";

export interface GraphsState {
    author: AllAuthorsResponse | null | undefined,
    rate: number[],
    articles: number,
    time_range: number[],
    common_terms: boolean,
    hanging_nodes: boolean,
    display_terms: boolean,
    terms_level: number
}

export interface ProduceConnectivityGraphRequest {
    author: string,
    range: number[],
    common: boolean,
    papers_to_scan: number,
    build_edges: boolean,
    time_range: number[],
    layout: boolean,
    level: number
}

export interface ProduceConnectivityGraphResponse {
    graph: {
        directed: boolean,
        graph: {},
        links: {
            source: string,
            target: string
        }[],
        multigraph: boolean,
        nodes: {
            adjacency: number,
            id: string,
            label: string,
            show: boolean
        }[]
    },
    pos: {
        [_: string]: number[]
    }
}

export interface PlotDataType {
    x: (number | null)[],
    y: (number | null)[],
    mode: string,
    marker?: any,

    [_: string]: any
}

// Новая версия

export interface AllAuthorsResponse {
    prnd_author_id: number
    fio: string
    publs_count: number
}

export interface AuthorMinMaxYearResponse {
    min: number
    max: number
}

export interface AuthorDeltasResponse {
    term_name: string
    term_freq: number
}//[]

export interface ProduceAuthorConnectivityGraphRequest {
    author_prnd_id: number
    min_node_count: number
    years_range: number[]
    use_common_terms: boolean
    factor_level: number
    scale_cutoff_by_paper_num: number
    keep_data_in_graph: boolean
    node_cutoff_mode: 'percent' | 'overall' | 'per_paper'
}

export interface Node {
    dp?: number
    adjacency?: number
    count?: number
    id: string
}

export interface Link {
    source: string
    target: string
}

export interface Graph {
    directed: boolean
    multigraph: boolean
    graph: {}
    nodes: Node[]
    links: Link[]
}
export interface Layout {
    term: string
    pos: number[]
}

export interface ProduceAuthorConnectivityGraphResponse {
    graph: Graph
    layout: Layout[]
}

export interface ProduceProfileMapResponse {
    ent: string
    pos: number[]
}//[]

export interface GetAuthorDeltasRequest {
    auth_prnd_id: number
    freq_cutoff: number
}

export interface ProduceThesaurusGraphRequst {
    thesaurus_type: 'new' | 'old'
    use_root?: string
    sg_depth?: number
    subtree_root_ids: number[]
}

export interface ProduceThesaurusGraphResponse {
    graph: Graph
    layout: Layout[]
}

export interface AllAviableSource {
    name_full: string
    name_disp: string
    name_req: string
}