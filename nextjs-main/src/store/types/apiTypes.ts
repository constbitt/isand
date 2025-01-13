import {FetchBaseQueryError, QueryStatus} from "@reduxjs/toolkit/query";
import {SerializedError} from "@reduxjs/toolkit";

export interface ApiResponse<T> {
    status: QueryStatus,
    isLoading: boolean,
    isError: boolean,
    data?: T | undefined,
    error?: FetchBaseQueryError | SerializedError | undefined,
}


export interface ErrorType {
    error: {
        status: number
        data: any
    }
    data?: undefined
    meta?: { request: Request; response: Response }
}
