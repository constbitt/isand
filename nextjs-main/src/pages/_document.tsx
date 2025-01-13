import {Head, Html, Main, NextScript} from 'next/document'

const Document = () => {
    return (
        <Html>
            <Head>
                <link rel="icon" href="/static/logo.ico"/>
            </Head>
            <body>
            <Main/>
            <NextScript/>
            </body>
        </Html>
    )
}

export default Document;