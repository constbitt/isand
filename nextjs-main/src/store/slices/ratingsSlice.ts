import {RatingsState} from "@/src/store/types/ratingsTypes";
import {Author} from "@/src/store/types/authorTypes";
import {Path} from "@/src/store/types/pathTypes";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "@/src/store/store";

const initialState: RatingsState = {
    ratings_type: "authors",
    ratings_path: null,
    level: 1,
}

export const ratingsSlice = createSlice({
    name: "ratings",
    initialState: initialState,
    reducers: {
        setRatingsType: (state, action: PayloadAction<string>) => {
            state.ratings_type = action.payload
        },
        setRatingsPath: (state, action: PayloadAction<Path | null>) => {
            state.ratings_path = action.payload
        },
        setLevel: (state, action: PayloadAction<number>) => {
            state.level = action.payload
        }

    }
})


export const {
    setRatingsType,
    setRatingsPath,
    setLevel,

} = ratingsSlice.actions

export const selectRatingsType = (state: RootState) => state.ratings.ratings_type
export const selectRatingsPath = (state: RootState) => state.ratings.ratings_path
export const selectLevel = (state: RootState) => state.ratings.level