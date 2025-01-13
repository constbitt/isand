import {Author} from "@/src/store/types/authorTypes";
import {Path} from "@/src/store/types/pathTypes";

export interface RatingsState {
    ratings_type: string,
    ratings_path: Path | null,
    level: number,
}


export interface RatingsResponseItem {
    id: string,
    name: string,
    value: number
}

export interface RatingsRequest {
    path: string,
    type: string
}