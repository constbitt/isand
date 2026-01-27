import AbortController from "abort-controller";
import React, {FC, ReactElement, ReactNode, useEffect, useState} from 'react'
import type {NextPage} from 'next'
import type {AppProps} from 'next/app'
import '../styles/globals.css'
import RootLayout from "@/src/components/Layouts/RootLayout/RootLayout";


import fetch, {Headers, Request, Response} from "node-fetch";


import {wrapper} from "@/src/store/store";
import {ThemeProvider} from "@mui/material";

import mainTheme from "@/src/styles/mainTheme";
import {Provider} from "react-redux";
import DefaultLayout from "@/src/components/Layouts/DefaultLayout/DefaultLayout";
import {useRouter} from "next/router";
import {breadcrumbs} from "@/src/configs/breadcrumbsConfig";

import Banner from '@/src/components/Banner/Banner';


Object.assign(globalThis, {
    fetch,
    Headers,
    Request,
    Response,
    AbortController,
});

type NextPageWithLayout = NextPage & {
    getLayout?: (page: ReactElement | ReactNode) => ReactNode,
    getRootLayout?: (page: ReactElement | ReactNode) => ReactNode,
}

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout
}

const App: NextPage<AppProps> = ({ Component, ...rest }: AppPropsWithLayout) => {
    //const [isBannerOpen, setIsBannerOpen] = useState(true);
    const router = useRouter();
/*
    useEffect(() => {
        setIsBannerOpen(true);
    }, [router.pathname]);
*/
    useEffect(() => {
    document.title = (breadcrumbs as any)[router.pathname.slice(1)] || "ISAND";
    }, [router.pathname, breadcrumbs]);

    const getRootLayout = Component.getRootLayout ?? ((page) => {
        return <RootLayout>{page}</RootLayout>
    })

    const getLayout = Component.getLayout ?? ((page) => {
        return <DefaultLayout>{page}</DefaultLayout>
    })

    const {store, props} = wrapper.useWrappedStore(rest);

    const {pageProps} = props;

    return (
        <>
            <Provider store={store}>
                <ThemeProvider theme={mainTheme}>
                    {/*<Banner isOpen={isBannerOpen} onClose={() => setIsBannerOpen(false)} />*/}
                    {getRootLayout(getLayout(<Component {...pageProps} />))}
                </ThemeProvider>
            </Provider>
        </>
    );
}


export default App;