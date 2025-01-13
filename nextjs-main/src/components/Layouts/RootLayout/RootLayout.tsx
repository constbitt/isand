import Footer from './Footer'
import Header from './Header'
import React from "react";

const RootLayout = ({
                        children,
                    }: {
    children: React.ReactNode
}) => {
    return (
        <>
            <div style={{height: "100vh", display: "flex", flexDirection: "column", padding: "16px"}}>
                <Header/>
                <div style={{flexGrow: 1}}>
                    {children}
                </div>
                <Footer/>
            </div>
        </>
    )
}

export default RootLayout;