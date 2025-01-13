import {PostsForGraphRequest} from "@/src/store/types/postsForGraphTypes";

export type ArticleRatingRequest = PostsForGraphRequest;

export interface ArticleRatingResponse {
    [author: string]: { [rating: string]: number }[]
}

export interface ArticleRatingResponsePreparedItem {
    author: string,
    ratings: { value: string, count: number }[]
}