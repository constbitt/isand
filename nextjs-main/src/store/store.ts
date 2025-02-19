// @ts-nocheck

import {configureStore} from '@reduxjs/toolkit';
import {createWrapper} from 'next-redux-wrapper';
import {serverApi} from "@/src/store/api/serverApi";
import {serverApiV2} from "@/src/store/api/serverApiV2";
import {serverApiV3} from "@/src/store/api/serverApiV3";
import {profilesSlice} from "@/src/store/slices/profilesSlice";
import {ratingsSlice} from "@/src/store/slices/ratingsSlice";
import {searchApiSlice} from "@/src/store/slices/searchApiSlice";
import {deepSearchSlice} from "@/src/store/slices/deepSearchSlice"
import {serverApiV4} from './api/serverApiV4';
import { headerModalSlice } from './slices/headerModalSlice';
import { alertationSlice } from './slices/alertationSlice';
import { serverApiV5 } from './api/serverApiV5';
import { serverApiV6 } from './api/serverApiV6';
import { serverApiV2_5 } from './api/serverApiV2_5';
import { serverApiFW, fetchPrndData } from './api/serverApiFW';

const makeStore = () => {
    return configureStore({
        reducer: {
            [serverApi.reducerPath]: serverApi.reducer,
            [serverApiV2.reducerPath]: serverApiV2.reducer,
            [serverApiV3.reducerPath]: serverApiV3.reducer,
            [serverApiV4.reducerPath]: serverApiV4.reducer,
            [serverApiV5.reducerPath]: serverApiV5.reducer,
            [serverApiV6.reducerPath]: serverApiV6.reducer,
            [serverApiV2_5.reducerPath]: serverApiV2_5.reducer,
            [serverApiFW.reducerPath]: serverApiFW.reducer,
            [profilesSlice.name]: profilesSlice.reducer,
            [ratingsSlice.name]: ratingsSlice.reducer,
            [searchApiSlice.name] : searchApiSlice.reducer,
            [deepSearchSlice.name] : deepSearchSlice.reducer,
            [headerModalSlice.name] : headerModalSlice.reducer,
            [alertationSlice.name] : alertationSlice.reducer,
        },
        middleware: (getDefaultMiddleware) => getDefaultMiddleware()
            .concat(serverApi.middleware)
            .concat(serverApiV2.middleware)
            .concat(serverApiV3.middleware)
            .concat(serverApiV4.middleware)
            .concat(serverApiV5.middleware)
            .concat(serverApiV6.middleware)
            .concat(serverApiV2_5.middleware)
            .concat(serverApiFW.middleware)
    });
};

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
// setupListeners(store.dispatch)

// Infer the `RootState` and `AppDispatch` types from the store itself
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = AppStore['dispatch'];

export const wrapper = createWrapper<AppStore>(makeStore);