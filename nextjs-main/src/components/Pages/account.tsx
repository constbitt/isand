import Cookies from "js-cookie";

import Head from "next/head";
import { useTypedSelector } from "@/src/hooks/useTypedSelector";
import { selectAuthorization } from "@/src/store/slices/headerModalSlice";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function AccountPageContent() {
    const authorization = useTypedSelector(selectAuthorization);
    const router = useRouter();

    useEffect(() => {
        if (!authorization) {
            router.replace("/");
        }
    }, [authorization, router]);

    if (!authorization) return null;

    return (
        <>
            <Head>
                <title>Личная страница</title>
            </Head>
        </>
    );
}
