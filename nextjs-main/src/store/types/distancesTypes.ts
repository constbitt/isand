import {Author} from "@/src/store/types/authorTypes";

export interface DistancesState {
    authors: Author[],
    cur_conference: string | undefined | null,
    conferences : string[]
}