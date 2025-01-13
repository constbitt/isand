export interface Author {
    id: string,
    value: string
}

export interface AuthorsPostsRequestItem {
    author_id: string
}

export interface AuthorsPostsRequest {
    authors: AuthorsPostsRequestItem[]
}


export interface AuthorsPostsPreparedResponseItem {
    id: string,
    name: string
}

export interface ProduceAuthorPublicationsCountRequest {
    author: number,
    range: number[]
}

export interface ProduceAuthorPublicationsCountResponse {
    count: number
}