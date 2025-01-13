import {Author} from "@/src/store/types/authorTypes";
import {Laboratory} from "@/src/store/types/laboratoryTypes";
import {Work} from "@/src/store/types/workTypes";

export interface ProfilesState {
    authors: Author[],
    laboratories: Laboratory[],
    works: Work[],
    level: number,
    category_cutting: number,
    terming_cutting: number,
    time_range: number[],
    scientific_terms: boolean,
    thesaurus_path: string[],
    graph_type: number,
    thesaurus_available_values : string[]
}


export interface ProfileChartItem {
    id: string,
    author_name?: string,
    lab_name?: string,
    author_value?: number,
    lab_value? : number
}