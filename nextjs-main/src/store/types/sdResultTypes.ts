export interface SearchApiPageRequest {
    id: number
}

export interface RoseOfWinds {
    id: number[]
    include_common_terms: number
    object_type: string
    level: number
}

export interface Rose {
    items: Item[]
}

export interface Item {
   id: number
   name: string
   factors: FactorsInfo[]
}

export interface FactorsInfo {
    factor_id: number
    variant: string
    value: number
    stochastic: number
}